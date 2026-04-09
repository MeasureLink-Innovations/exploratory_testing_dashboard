const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '24h';

const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      is_admin: user.is_admin,
      must_change_password: user.must_change_password
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
