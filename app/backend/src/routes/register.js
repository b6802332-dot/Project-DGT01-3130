const router = require('express').Router();
const pool = require('../db');

const semester = () => process.env.SEMESTER || '1/2569';

router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'ต้องระบุ student_id' });
  try {
    const r = await pool.query(
      `SELECT e.course_code, c.course_name, c.credit, e.semester
       FROM enrollments e JOIN courses c USING (course_code)
       WHERE e.student_id = $1 AND e.semester = $2 ORDER BY e.course_code`,
      [student_id, semester()]);
    res.json({ student_id, semester: semester(), items: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' });
  }
});

router.post('/', async (req, res) => {
  const { student_id, course_code } = req.body || {};
  if (!student_id || !course_code) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ล็อกแถวรายวิชา ทำให้คนที่กดพร้อมกันต้องรอคิว ไม่ลงเกินที่นั่ง
    const c = await client.query(
      'SELECT seats FROM courses WHERE course_code = $1 FOR UPDATE', [course_code]);
    if (!c.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'ไม่พบรายวิชา' });
    }
    const n = await client.query(
      'SELECT COUNT(*)::int AS n FROM enrollments WHERE course_code = $1 AND semester = $2',
      [course_code, semester()]);
    if (n.rows[0].n >= c.rows[0].seats) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'ที่นั่งเต็ม' });
    }
    await client.query(
      'INSERT INTO enrollments (student_id, course_code, semester) VALUES ($1, $2, $3)',
      [student_id, course_code, semester()]);
    await client.query('COMMIT');
    res.status(201).json({ student_id, course_code, semester: semester() });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    if (e.code === '23505') return res.status(409).json({ error: 'ลงทะเบียนวิชานี้แล้ว' });
    if (e.code === '23503') return res.status(400).json({ error: 'ไม่พบรหัสนักเรียนหรือรายวิชา' });
    console.error(e);
    res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' });
  } finally {
    client.release();
  }
});

module.exports = router;
