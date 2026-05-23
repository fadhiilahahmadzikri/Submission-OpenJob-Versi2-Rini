const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) =>
  jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: '3h',
    }
  );

const generateRefreshToken = (payload) =>
  jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_KEY
  );

const verifyRefreshToken = (refreshToken) =>
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_KEY
  );

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};