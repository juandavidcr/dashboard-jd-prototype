const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS grupos (
      idgrupo INT AUTO_INCREMENT PRIMARY KEY,
      consecutivo INT,
      nombre VARCHAR(255),
      clasificacion VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

router.get('/', async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT idgrupo, consecutivo, nombre, clasificacion FROM grupos ORDER BY consecutivo ASC');
    res.json(rows);
  } catch (err) {
    console.error('groups.get error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { consecutivo, nombre, clasificacion } = req.body;
    if (nombre == null || clasificacion == null) return res.status(400).json({ error: 'Missing fields' });
    const allowed = ['mando gerente', 'mando medio', 'empleado'];
    if (!allowed.includes(clasificacion)) return res.status(400).json({ error: 'Invalid clasificacion' });
    await ensureTable();
    const [result] = await pool.query('INSERT INTO grupos (consecutivo, nombre, clasificacion) VALUES (?, ?, ?)', [consecutivo || null, nombre, clasificacion]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('groups.post error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
