const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const pool = require('../services/database');

const userSchema = require('../validators/userSchema');

const registerUser = async (req, res) => {
  try {

  
    const { error } =
      userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details[0].message,
      });
    }

    const {
      name,
      email,
      password,
      role,
    } = req.body;


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


    const hashedPassword =
      await bcrypt.hash(password, 10);

    
    const id = `user-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO users(
        id,
        name,
        email,
        password,
        role
      )
      VALUES($1, $2, $3, $4, $5)
      `,
      [
        id,
        name,
        email,
        hashedPassword,
        role || 'user',
      ]
    );
    return res.status(201).json({
      status: 'success',
      data: {
        userId: id,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });

  }
};

const getUserById = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        created_at
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

    return res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0],
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'error',
      message: error.message,
    });

  }
};

module.exports = {
  registerUser,
  getUserById,
};