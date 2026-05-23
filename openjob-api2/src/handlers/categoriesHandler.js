const { nanoid } = require('nanoid');
const pool = require('../services/database');

/**
 * CREATE CATEGORY
 */
const createCategory = async (req, res) => {
  try {
    const { name } = req.body || {};

    // VALIDASI
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'failed',
        message: 'Category name is required',
      });
    }

    const id = `category-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO categories (id, name, created_at, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [id, name.trim()]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        id,
      },
    });

  } catch (error) {
    console.log('CREATE CATEGORY ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

/**
 * GET ALL CATEGORIES
 */
const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        created_at,
        updated_at
      FROM categories
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      status: 'success',
      data: {
        categories: result.rows || [],
      },
    });

  } catch (error) {
    console.log('GET ALL CATEGORY ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

/**
 * GET CATEGORY BY ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        created_at,
        updated_at
      FROM categories
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });

  } catch (error) {
    console.log('GET BY ID ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

/**
 * UPDATE CATEGORY
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'failed',
        message: 'Category name is required',
      });
    }

    const result = await pool.query(
      `
      UPDATE categories
      SET
        name = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
      `,
      [name.trim(), id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
    });

  } catch (error) {
    console.log('UPDATE CATEGORY ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

/**
 * DELETE CATEGORY
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });

  } catch (error) {
    console.log('DELETE CATEGORY ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};