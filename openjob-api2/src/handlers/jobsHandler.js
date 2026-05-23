const { nanoid } = require('nanoid');

const pool = require('../services/database');

const createJob = async (req, res) => {

  try {

    const {
      title,
      description,
      company_id,
      category_id,
    } = req.body;

    /**
     * VALIDATION
     */
    if (
      !title ||
      !company_id ||
      !category_id
    ) {

      return res.status(400).json({
        status: 'failed',
        message:
          'Title, company_id, and category_id are required',
      });
    }

    const id = `job-${nanoid(16)}`;

    /**
     * INSERT JOB
     */
    await pool.query(
      `
      INSERT INTO jobs (
        id,
        title,
        description,
        company_id,
        category_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      `,
      [
        id,
        title,
        description || null,
        company_id,
        category_id,
      ]
    );

    /**
     * SUCCESS RESPONSE
     */
    return res.status(201).json({
      status: 'success',
      data: {
        id: id,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {

  try {

    const {
      title,
      'company-name': companyName,
    } = req.query;

    let queryStr = `
      SELECT
        jobs.id,
        jobs.title,
        jobs.description,
        jobs.company_id,
        jobs.category_id,
        jobs.created_at,
        companies.name AS company_name,
        companies.location AS company_location,
        companies.description AS company_description,
        companies.owner_id AS owner_id,
        categories.name AS category_name,
        categories.created_at AS category_created_at,
        categories.updated_at AS category_updated_at
      FROM jobs
      LEFT JOIN companies
        ON jobs.company_id = companies.id
      LEFT JOIN categories
        ON jobs.category_id = categories.id
      WHERE 1=1
    `;

    const queryParams = [];

    /**
     * FILTER TITLE
     */
    if (title) {

      queryParams.push(`%${title}%`);

      queryStr += `
        AND jobs.title ILIKE $${queryParams.length}
      `;
    }

    /**
     * FILTER COMPANY
     */
    if (companyName) {

      queryParams.push(
        `%${companyName}%`
      );

      queryStr += `
        AND companies.name ILIKE $${queryParams.length}
      `;
    }

    queryStr += `
      ORDER BY jobs.created_at DESC
    `;

    const result = await pool.query(
      queryStr,
      queryParams
    );

    return res.status(200).json({
      status: 'success',
      data: {
        jobs: result.rows,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getJobById = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
      `,
      [id]
    );

    /**
     * JOB NOT FOUND
     */
    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message: 'Job not found',
      });
    }

    /**
     * SUCCESS RESPONSE
     */
    return res.status(200).json({
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

const getJobsByCompany = async (
  req,
  res
) => {

  try {

    const { companyId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE company_id = $1
      ORDER BY created_at DESC
      `,
      [companyId]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        jobs: result.rows,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getJobsByCategory = async (
  req,
  res
) => {

  try {

    const { categoryId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE category_id = $1
      ORDER BY created_at DESC
      `,
      [categoryId]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        jobs: result.rows,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const updateJob = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const fields = [];

    const values = [];

    let idx = 1;

    const allowedFields = [
      'title',
      'description',
      'company_id',
      'category_id',
    ];

    /**
     * BUILD UPDATE QUERY
     */
    for (const field of allowedFields) {

      if (
        req.body[field] !== undefined
      ) {

        fields.push(
          `${field} = $${idx++}`
        );

        values.push(
          req.body[field]
        );
      }
    }

    /**
     * NO FIELD
     */
    if (fields.length === 0) {

      return res.status(400).json({
        status: 'failed',
        message:
          'No fields to update',
      });
    }

    values.push(id);

    const result = await pool.query(
      `
      UPDATE jobs
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
      `,
      values
    );

    /**
     * JOB NOT FOUND
     */
    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message:
        'Job updated successfully',
      data: {
        id: result.rows[0].id,
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const deleteJob = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM jobs
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    /**
     * JOB NOT FOUND
     */
    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message:
        'Job deleted successfully',
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobsByCompany,
  getJobsByCategory,
  updateJob,
  deleteJob,
};