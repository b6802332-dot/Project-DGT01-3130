const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'ต้องระบุ student_id' });
  try {
    const r = await pool.query(
      `SELECT g.semester, g.course_code, c.course_name, c.credit, g.grade
       FROM grades g JOIN courses c USING (course_code)
       WHERE g.student_id = $1 ORDER BY g.semester, g.course_code`, [student_id]);
    res.json({ student_id, items: r.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' }); }
});

module.exports = router;
