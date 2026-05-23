const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    return res.status(401).json({
      status: 'failed',
      message: 'Missing authentication',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {

    return res.status(401).json({
      status: 'failed',
      message: 'Invalid token',
    });
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_KEY
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      status: 'failed',
      message: 'Invalid token',
    });
  }
};

module.exports = auth;