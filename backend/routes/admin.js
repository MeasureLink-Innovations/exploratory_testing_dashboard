const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword } = require('../services/auth.service');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users - List all users
router.get('/users', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, is_admin, must_change_password, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users - Create new user
router.post('/users', async (req, res, next) => {
  try {
    const { username, email, password, is_admin = false } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const password_hash = await hashPassword(password);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, is_admin, must_change_password) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, is_admin, must_change_password, created_at',
      [username, email, password_hash, is_admin, true] // Always force password change for new users
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    next(err);
  }
});

module.exports = router;
