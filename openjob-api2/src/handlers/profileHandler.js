const pool = require('../services/database');

const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, role
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

    return res.json({
      status: 'success',
      data: result.rows[0],
    });

  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getProfileApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        applications.id,
        applications.user_id,
        applications.job_id,
        applications.status,
        applications.created_at,
        jobs.title AS job_title,
        jobs.description AS job_description,
        jobs.company_id,
        jobs.category_id,
        jobs.created_at AS job_created_at,
        companies.name AS company_name,
        companies.location AS company_location,
        companies.description AS company_description,
        companies.owner_id AS owner_id,
        categories.name AS category_name
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      LEFT JOIN companies ON jobs.company_id = companies.id
      LEFT JOIN categories ON jobs.category_id = categories.id
      WHERE applications.user_id = $1
      `,
      [userId]
    );

    return res.json({
      status: 'success',
      data: {
        applications: result.rows,
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getProfileBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
const result = await pool.query(
  `
  SELECT
    bookmarks.id,
    bookmarks.user_id,
    bookmarks.job_id,
    bookmarks.created_at AS bookmark_created_at,
    jobs.title,
    jobs.description,
    jobs.company_id,
    jobs.category_id,
    jobs.created_at AS job_created_at,
    companies.name AS company_name,
    companies.location AS company_location,
    companies.description AS company_description,
    companies.owner_id AS owner_id,
    categories.name AS category_name,
    categories.created_at AS category_created_at,
    categories.updated_at AS category_updated_at,
    NULL AS extra_1,
    NULL AS extra_2
  FROM bookmarks
  JOIN jobs ON bookmarks.job_id = jobs.id
  LEFT JOIN companies ON jobs.company_id = companies.id
  LEFT JOIN categories ON jobs.category_id = categories.id
  WHERE bookmarks.user_id = $1
  `,
  [userId]
);
    return res.json({
      status: 'success',
      data: {
        bookmarks: result.rows,
      },
    });

  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  getProfileApplications,
  getProfileBookmarks,
};