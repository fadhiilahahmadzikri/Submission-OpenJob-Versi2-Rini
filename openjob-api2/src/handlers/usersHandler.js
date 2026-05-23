const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const pool = require('../services/database');
const redisClient = require('../services/redis');
const registerUser = async (req, res) => {
  try {

    const {
      name,
      fullname,
      email,
      password,
      role,
    } = req.body;
    const userName = name || fullname;
    if (
      !userName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid payload',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        status: 'failed',
        message: 'Password minimum 6 characters',
      });
    }
    const checkEmail = await pool.query(
      `
      SELECT email
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email already exists',
      });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // generate id
    const id = `user-${nanoid(16)}`;

    // insert database
    await pool.query(
      `
      INSERT INTO users (
        id,
        name,
        email,
        password,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        id,
        userName,
        email,
        hashedPassword,
        role || 'user',
      ]
    );

    return res.status(201).json({
      status: 'success',
      data: {
        id: id,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });

  }
};
const getUserById = async (req, res) => {
  try {

    const { id } = req.params;

    // Check Redis cache first
    try {
      const cachedUser = await redisClient.get(`user:${id}`);
      if (cachedUser) {
        return res
          .set('X-Data-Source', 'cache')
          .status(200)
          .json({
            status: 'success',
            data: JSON.parse(cachedUser),
          });
      }
    } catch (redisError) {
      console.log('Redis GET error:', redisError.message);
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        resume,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    // Save to Redis cache with 3600s TTL
    try {
      await redisClient.setEx(`user:${id}`, 3600, JSON.stringify(user));
    } catch (redisError) {
      console.log('Redis SETEX error:', redisError.message);
    }

    return res
      .set('X-Data-Source', 'database')
      .status(200)
      .json({
        status: 'success',
        data: user,
      });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });

  }
};

module.exports = {
  registerUser,
  getUserById,
};