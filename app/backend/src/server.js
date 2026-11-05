const express = require('express');
const pool = require('./db');
const app = express();
app.use(express.json());

app.get('/healthz', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch (e) { res.status(500).json({ error: 'db not ready' }); }
});

app.use('/api/grades', require('./routes/grades'));
app.use('/api/gpa', require('./routes/gpa'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/register', require('./routes/register'));
app.use('/api/announcements', require('./routes/announcements'));

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('backend up'));
