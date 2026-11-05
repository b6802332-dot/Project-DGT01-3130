const router = require('express').Router();
const pool = require('../db');
const SEMESTER = process.env.SEMESTER || '1/2569';

router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'ต้องระบุ student_id' });
  try {
    const r = await pool.query(
      `SELECT s.course_code, c.course_name, s.day, s.start_time, s.end_time, s.room,
              to_char(s.exam_date, 'YYYY-MM-DD') AS exam_date, s.exam_start, s.exam_end, s.exam_room
       FROM enrollments e
       JOIN schedules s ON s.course_code = e.course_code
       JOIN courses c ON c.course_code = e.course_code
       WHERE e.student_id = $1 AND e.semester = $2
       ORDER BY s.course_code`, [student_id, SEMESTER]);
    res.json({ student_id, semester: SEMESTER, items: r.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' }); }
});

module.exports = router;
