const User = require('../../models/User');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user && user.isAdmin) {
      console.log(`Admin check passed for user: ${user.username}`);
      next();
    } else {
      console.log(`User ${user ? user.username : 'unknown'} attempted to access admin-only route.`);
      res.status(403).send('Access denied. Admin rights required.');
    }
  } catch (error) {
    console.error('Admin check error:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = isAdmin;