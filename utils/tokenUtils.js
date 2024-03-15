const jwt = require('jsonwebtoken');

// Load the secret key from environment variables
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateToken = (user) => {
  try {
    const payload = {
      id: user._id,
      username: user.username
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    console.log(`Token generated for user: ${user.username}`);
    return token;
  } catch (error) {
    console.error('Error generating token:', error.message, error.stack);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(`Token verified. User ID: ${decoded.id}`);
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error.message, error.stack);
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken
};