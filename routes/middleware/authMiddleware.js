const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const isAuthenticated = async (req, res, next) => {
  // Check if the request has a session and a userId
  if (req.session && req.session.userId) {
    console.log("User authenticated via session.");
    return next(); // User is authenticated, proceed to the next middleware/route handler
  }
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log("Authorization token not found in the request header.");
      return res.status(401).send('Token not found');
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Make sure this matches your .env variable
      try {
        const user = await User.findById(decoded.userId);
        if (!user) {
          console.log(`User with ID ${decoded.userId} not found.`);
          return res.status(401).send('User not found');
        }
        console.log(`User ${user.username} authenticated via JWT.`);
        req.user = user; // Add user to request object
        req.session.userId = user._id; // Set userId in session for JWT authenticated user
        next();
      } catch (err) {
        console.error('Error finding user in isAuthenticated middleware:', err.message, err.stack);
        return res.status(500).send('Error verifying token');
      }
    } catch (error) {
      console.error('Error verifying token in isAuthenticated middleware:', error.message, error.stack);
      return res.status(403).send('Invalid or expired token');
    }
  } else {
    console.log("No authorization header found in the request.");
    return res.status(401).send('You are not authenticated');
  }
};

module.exports = {
  isAuthenticated
};