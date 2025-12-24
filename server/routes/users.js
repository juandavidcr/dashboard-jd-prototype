const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// POST /api/users/create
router.post('/create', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono } = req.body;
    if (!email || !nombre || !apellido) return res.status(400).json({ error: 'Missing required fields' });

    // Check if user exists
    const [existing] = await pool.query('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.json({ success: true, exists: true, id: existing[0].id });
    }

    // Generate random password
    const plainPassword = crypto.randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(plainPassword, 10);

    // Insert into users table (basic columns assumed)
    const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
    const userId = result.insertId;

    // Create user_profiles table if not exists and insert profile with role=admin
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nombre VARCHAR(200),
        apellido VARCHAR(200),
        telefono VARCHAR(50),
        role VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query('INSERT INTO user_profiles (user_id, nombre, apellido, telefono, role) VALUES (?, ?, ?, ?, ?)', [userId, nombre, apellido, telefono || null, 'admin']);

    return res.json({ success: true, id: userId, password: plainPassword });
  } catch (err) {
    console.error('users.create error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
