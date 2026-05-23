const pool = require('../services/database');
const { nanoid } = require('nanoid');
const redisClient = require('../services/redis');

const addBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        status: 'failed',
        message: 'Job ID is required',
      });
    }

    const id = `bookmark-${nanoid(16)}`;

    const result = await pool.query(
      `
      INSERT INTO bookmarks(id, user_id, job_id)
      VALUES($1, $2, $3)
      RETURNING id
      `,
      [id, userId, jobId]
    );

    try {
      await redisClient.del(`bookmarks:user:${userId}`);
    } catch (cacheError) {
      // Redis failure is non-critical, continue
    }

    return res.status(201).json({
      status: 'success',
      message: 'Bookmark added successfully',
      data: {
        id: result.rows[0].id,
      },
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'failed',
        message: 'Job already bookmarked',
      });
    }

    if (error.code === '23503') {
      return res.status(404).json({
        status: 'failed',
        message: 'Job not found',
      });
    }

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `bookmarks:user:${userId}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        res.setHeader('X-Data-Source', 'cache');
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      // Redis failure is non-critical, fall through to DB
    }

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

    const responseData = {
      status: 'success',
      data: {
        bookmarks: result.rows,
      },
    };

    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    } catch (cacheError) {
      // Redis failure is non-critical, continue
    }

    res.setHeader('X-Data-Source', 'database');
    return res.json(responseData);

  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getBookmarkById = async (req, res) => {
  try {
    const { jobId, id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM bookmarks
      WHERE id = $1 AND job_id = $2 AND user_id = $3
      `,
      [id, jobId, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Bookmark not found',
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

const deleteBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        status: 'failed',
        message: 'Job ID is required',
      });
    }

    const result = await pool.query(
      `
      DELETE FROM bookmarks
      WHERE user_id = $1
      AND job_id = $2
      RETURNING id
      `,
      [userId, jobId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Bookmark not found',
      });
    }

    try {
      await redisClient.del(`bookmarks:user:${userId}`);
    } catch (cacheError) {
      // Redis failure is non-critical, continue
    }

    return res.json({
      status: 'success',
      message: 'Bookmark deleted successfully',
    });

  } catch (error) {
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

module.exports = {
  addBookmark,
  getBookmarks,
  getBookmarkById,
  deleteBookmark,
};