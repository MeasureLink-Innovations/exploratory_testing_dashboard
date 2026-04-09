const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    // This should ideally be caught by authMiddleware, but as a safeguard:
    return res.status(401).json({ error: 'Unauthorized: Authentication token missing or invalid' });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Access Denied: Administrator privileges required' });
  }
  next();
};

module.exports = adminMiddleware;
