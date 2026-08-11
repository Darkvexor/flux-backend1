module.exports = async (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (adminKey !== 'flux-admin-secret-2024') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};