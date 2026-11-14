const express = require('express');
const pool = require('./db');
pool.on('error', (e) => console.error('pg pool error:', e.message));
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/healthz' || req.path === '/readyz') return next();
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} pod=${process.env.HOSTNAME}`));
  next();
});

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.get('/readyz', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ready' }); }
  catch (e) { res.status(503).json({ error: 'db not ready' }); }
});

app.use('/api/grades', require('./routes/grades'));
app.use('/api/gpa', require('./routes/gpa'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/register', require('./routes/register'));
app.use('/api/announcements', require('./routes/announcements'));

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('backend up'));
