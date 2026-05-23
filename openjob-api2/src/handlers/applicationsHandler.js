const { nanoid } = require('nanoid');
const pool = require('../services/database');
const connectRabbitMQ = require('../services/rabbitmq');
const redisClient = require('../services/redis');

const createApplication = async (req, res) => {
  try {

    const { job_id } = req.body;
    const user_id = req.user.id;

    if (!job_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Job ID is required',
      });
    }

    const id = `application-${nanoid(16)}`;

    const result = await pool.query(
      `
      INSERT INTO applications (
        id,
        user_id,
        job_id
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id, user_id, job_id]
    );
    const channel = await connectRabbitMQ();

    const queueName = 'application:created';

    await channel.assertQueue(queueName);

    const message = JSON.stringify({
      application_id: result.rows[0].id,
    });

    channel.sendToQueue(
      queueName,
      Buffer.from(message)
    );
    try {
      await redisClient.del(`applications:user:${user_id}`);
      await redisClient.del(`applications:job:${job_id}`);
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    return res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: {
        id: result.rows[0].id,
        status: 'pending',
        job_id: job_id,
        user_id: user_id
      },
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'failed',
        message: 'You have already applied for this job',
      });
    }
    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        applications.id,
        applications.user_id,
        applications.job_id,
        applications.status,
        applications.created_at,
        users.name AS user_name,
        users.email AS user_email,
        users.role AS user_role,
        jobs.title AS job_title,
        jobs.description AS job_description,
        jobs.company_id AS company_id,
        jobs.category_id AS category_id,
        jobs.created_at AS job_created_at
      FROM applications
      JOIN users ON applications.user_id = users.id
      JOIN jobs ON applications.job_id = jobs.id
      ORDER BY applications.created_at DESC
    `);

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

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const cachedData = await redisClient.get(`application:${id}`);
      if (cachedData) {
        res.setHeader('X-Data-Source', 'cache');
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    const result = await pool.query(
      `
      SELECT *
      FROM applications
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Application not found',
      });
    }

    const responseData = {
      status: 'success',
      data: result.rows[0],
    };

    try {
      await redisClient.setEx(`application:${id}`, 3600, JSON.stringify(responseData));
    } catch (cacheError) {
      // Redis failure should not affect the response
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

const getApplicationsByUser = async (req, res) => {
  try {

    const { userId } = req.params;

    try {
      const cachedData = await redisClient.get(`applications:user:${userId}`);
      if (cachedData) {
        res.setHeader('X-Data-Source', 'cache');
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    const result = await pool.query(
      `
      SELECT
        applications.*,
        jobs.title AS job_title
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      WHERE applications.user_id = $1
      `,
      [userId]
    );

    const responseData = {
      status: 'success',
      data: {
        applications: result.rows,
      },
    };

    try {
      await redisClient.setEx(`applications:user:${userId}`, 3600, JSON.stringify(responseData));
    } catch (cacheError) {
      // Redis failure should not affect the response
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

const getApplicationsByJob = async (req, res) => {
  try {

    const { jobId } = req.params;

    try {
      const cachedData = await redisClient.get(`applications:job:${jobId}`);
      if (cachedData) {
        res.setHeader('X-Data-Source', 'cache');
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    const result = await pool.query(
      `
      SELECT
        applications.*,
        users.name AS user_name
      FROM applications
      JOIN users ON applications.user_id = users.id
      WHERE applications.job_id = $1
      `,
      [jobId]
    );

    const responseData = {
      status: 'success',
      data: {
        applications: result.rows,
      },
    };

    try {
      await redisClient.setEx(`applications:job:${jobId}`, 3600, JSON.stringify(responseData));
    } catch (cacheError) {
      // Redis failure should not affect the response
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

const updateApplication = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Application not found',
      });
    }

    const updated_row = result.rows[0];

    try {
      await redisClient.del(`application:${id}`);
      await redisClient.del(`applications:user:${updated_row.user_id}`);
      await redisClient.del(`applications:job:${updated_row.job_id}`);
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    return res.json({
      status: 'success',
      message: 'Application updated successfully',
      data: {
        application: updated_row,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });

  }
};

const deleteApplication = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM applications
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Application not found',
      });
    }

    const deleted_row = result.rows[0];

    try {
      await redisClient.del(`application:${id}`);
      await redisClient.del(`applications:user:${deleted_row.user_id}`);
      await redisClient.del(`applications:job:${deleted_row.job_id}`);
    } catch (cacheError) {
      // Redis failure should not affect the response
    }

    return res.json({
      status: 'success',
      message: 'Application deleted successfully',
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });

  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplication,
  deleteApplication,
};