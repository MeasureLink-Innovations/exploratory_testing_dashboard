const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Conditionally set must_change_password flag in token
    const token = generateToken(user);
    
    // Don't send password_hash back
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/setup-account - First-time setup
router.patch('/setup-account', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required setup fields' });
    }

    const password_hash = await hashPassword(password);

    const result = await db.query(
      'UPDATE users SET username = $1, email = $2, password_hash = $3, must_change_password = false WHERE id = $4 RETURNING id, username, email, is_admin, must_change_password',
      [username, email, password_hash, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const token = generateToken(user); // Generate fresh token without must_change_password flag

    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    next(err);
  }
});

module.exports = router;
