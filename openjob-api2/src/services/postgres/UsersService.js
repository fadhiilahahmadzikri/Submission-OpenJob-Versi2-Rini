const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

class UsersService {
  constructor(pool) {
    this._pool = pool;
  }

  async getUsers() {
    const result = await this._pool.query(`
      SELECT
        id,
        name,
        email,
        role
      FROM users
    `);

    return result.rows;
  }

  async addUser({ name, email, password, role }) {
    try {
      const checkEmail = await this._pool.query(
        `
        SELECT email
        FROM users
        WHERE email = $1
        `,
        [email]
      );

      if (checkEmail.rows.length > 0) {
        throw new Error('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const id = `user-${nanoid(16)}`;

      const query = {
        text: `
          INSERT INTO users (
            id,
            name,
            email,
            password,
            role
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, email, role
        `,
        values: [
          id,
          name,
          email,
          hashedPassword,
          role || 'user',
        ],
      };

      const result = await this._pool.query(query);

      return result.rows[0];

    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    const query = {
      text: `
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}

module.exports = UsersService;