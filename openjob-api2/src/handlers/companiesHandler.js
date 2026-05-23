const { nanoid } = require('nanoid');
const pool = require('../services/database');
const redisClient = require('../services/redis');
const createCompany = async (req, res) => {
  try {
    const { name, location, description, owner_id } = req.body || {};
    const ownerId = owner_id || (req.user ? req.user.id : null);
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'failed',
        message: 'Company name is required',
      });
    }

    const id = `company-${nanoid(16)}`;

    await pool.query(
      `
      INSERT INTO companies (id, name, location, description, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        id,
        name.trim(),
        location || null,
        description || null,
        ownerId,
      ]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { id },
    });

  } catch (error) {
    console.log('CREATE ERROR:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        status: 'failed',
        message: 'Company name already exists',
      });
    }

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};
const getCompanies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM companies
      ORDER BY created_at DESC
    `);

    const companies = Array.isArray(result?.rows) ? result.rows : [];

    return res.status(200).json({
      status: 'success',
      data: {
        companies: companies.map((c) => ({
          id: c.id,
          name: c.name ?? '-',
          location: c.location ?? '-',
          description: c.description ?? '-',
          created_at: c.created_at,
          owner_id: c.owner_id ?? null,
        })),
      },
    });

  } catch (error) {
    console.log('GET ALL ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `company:${id}`;

    /**
     * CHECK CACHE
     */
    let cachedCompany = null;

    try {
      cachedCompany = await redisClient.get(cacheKey);
    } catch (err) {
      cachedCompany = null;
    }

    /**
     * CACHE HIT
     */
    if (cachedCompany) {

      // IMPORTANT
      res.setHeader(
        'X-Data-Source',
        'cache'
      );

      return res.status(200).json({
        status: 'success',
        data: JSON.parse(cachedCompany),
      });
    }

    /**
     * DATABASE QUERY
     */
    const result = await pool.query(
      `
      SELECT *
      FROM companies
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Company not found',
      });
    }

    const company = result.rows[0];

    const responseData = {
      id: company.id,
      name: company.name ?? '-',
      location: company.location ?? '-',
      description: company.description ?? '-',
      created_at: company.created_at,
      owner_id: company.owner_id ?? null,
    };

    /**
     * SAVE TO REDIS
     */
    try {
      await redisClient.setEx(
        cacheKey,
        3600,
        JSON.stringify(responseData)
      );
    } catch (err) {}

    /**
     * IMPORTANT
     * CACHE MISS = DATABASE
     */
    res.setHeader(
      'X-Data-Source',
      'database'
    );

    return res.status(200).json({
      status: 'success',
      data: responseData,
    });

  } catch (error) {

    console.log('GET BY ID ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: 'failed',
        message: 'Company name is required',
      });
    }

    const result = await pool.query(
      `
      UPDATE companies
      SET name = $1,
          location = $2,
          description = $3
      WHERE id = $4
      RETURNING id
      `,
      [name.trim(), location || null, description || null, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Company not found',
      });
    }

    try {
      await redisClient.del(`company:${id}`);
    } catch (err) {}

    return res.status(200).json({
      status: 'success',
      message: 'Company updated successfully',
    });

  } catch (error) {
    console.log('UPDATE ERROR:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        status: 'failed',
        message: 'Company name already exists',
      });
    }

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM companies
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 'failed',
        message: 'Company not found',
      });
    }

    try {
      await redisClient.del(`company:${id}`);
    } catch (err) {}

    return res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully',
    });

  } catch (error) {
    console.log('DELETE ERROR:', error);

    return res.status(500).json({
      status: 'failed',
      message: 'internal server error',
    });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};