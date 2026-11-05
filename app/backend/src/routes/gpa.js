const router = require('express').Router();
const pool = require('../db');
const POINT = { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, F: 0 };

router.get('/', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'ต้องระบุ student_id' });
  try {
    const r = await pool.query(
      `SELECT c.credit, g.grade FROM grades g JOIN courses c USING (course_code)
       WHERE g.student_id = $1`, [student_id]);
    const total = r.rows.reduce((s, x) => s + x.credit, 0);
    const sum = r.rows.reduce((s, x) => s + x.credit * POINT[x.grade], 0);
    res.json({ student_id, gpa: total ? Math.round((sum / total) * 100) / 100 : 0, total_credit: total });
  } catch (e) { console.error(e); res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' }); }
});

module.exports = router;
