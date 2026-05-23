const bcrypt = require('bcrypt');
const pool = require('../services/database');

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../token/tokenManager');

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email and password are required',
      });
    }
    const result = await pool.query(
      `
      SELECT id, name, email, password, role
      FROM users
      WHERE email = $1
      `,
      [email]
    );
    if (!result.rows.length) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Cek password
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid credentials',
      });
    }


    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await pool.query(
      `
      INSERT INTO authentications (token)
      VALUES ($1)
      `,
      [refreshToken]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};
const refreshAuthentication = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token is required',
      });
    }


    const result = await pool.query(
      `
      SELECT token
      FROM authentications
      WHERE token = $1
      `,
      [refreshToken]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token not found',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token is required',
      });
    }

    const result = await pool.query(
      `
      DELETE FROM authentications
      WHERE token = $1
      RETURNING token
      `,
      [refreshToken]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        status: 'failed',
        message: 'Refresh token not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Logout success',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

module.exports = {
  loginUser,
  refreshAuthentication,
  logoutUser,
};