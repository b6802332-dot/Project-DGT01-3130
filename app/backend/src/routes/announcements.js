const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, title, body, to_char(published_at, 'YYYY-MM-DD') AS published_at
       FROM announcements ORDER BY published_at DESC, id DESC`);
    res.json({ items: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'เซิร์ฟเวอร์ผิดพลาด' });
  }
});

module.exports = router;
