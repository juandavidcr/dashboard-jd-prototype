const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

async function getUserByEmail(email) {
  const [rows] = await pool.query("SELECT id, email, password FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0];
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid auth" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    const u = rows[0];
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json({ id: u.id, email: u.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "currentPassword and newPassword required" });
  try {
    const [rows] = await pool.query("SELECT password FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: "Current password invalid" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update password directly for authenticated user by providing only the new password.
// Useful for admin-driven resets or flows where current password is not required.
router.post("/update-password", authMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "newPassword required" });
  if (typeof newPassword !== "string" || newPassword.length < 6) return res.status(400).json({ error: "newPassword must be at least 6 characters" });
  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  // For JWT stateless logout, client should discard token. Endpoint exists for parity.
  res.json({ success: true });
});

// Request password reset: generates a short-lived token (simulates email)
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const [rows] = await pool.query('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);
    const user = rows[0];
    if (!user) {
      // Not found: respond 404 (frontend may choose to treat admin override differently)
      return res.status(404).json({ error: 'Email not found' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    // In production: send token via email. Here we return it for demo purposes.
    return res.json({ success: true, resetToken: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Reset password using token (from /request-password-reset)
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
  try {
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const userId = payload.id;
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
