const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const semester = process.env.SEMESTER || '1/2569';
  try {
    const r = await pool.query(
      `SELECT c.course_code, c.course_name, c.credit, c.seats,
              (SELECT COUNT(*)::int FROM enrollments e
                WHERE e.course_code = c.course_code AND e.semester = $1) AS enrolled
       FROM courses c ORDER BY c.course_code`, [semester]);
    res.json({ semester, items: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' });
  }
});

module.exports = router;
