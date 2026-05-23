const fs = require('fs');

const path = require('path');

const { nanoid } = require('nanoid');

const pool = require('../services/database');

/**
 * UPLOAD DOCUMENT
 */
const uploadDocument = async (
  req,
  res,
  next
) => {

  try {

    /**
     * FILE REQUIRED
     */
    if (!req.file) {

      return res.status(400).json({
        status: 'failed',
        message: 'File is required',
      });
    }

    const documentId =
      `document-${nanoid(16)}`;

    const {
      filename,
      originalname,
      size,
    } = req.file;

    const userId = req.user.id;

    /**
     * FILE PATH
     */
    const filepath = path.join(
      'uploads',
      filename
    );

    /**
     * SAVE TO DATABASE
     */
    await pool.query(
      `
      INSERT INTO documents (
        id,
        filename,
        original_name,
        size,
        filepath,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        documentId,
        filename,
        originalname,
        size,
        filepath,
        userId,
      ]
    );

    /**
     * SUCCESS RESPONSE
     */
    return res.status(201).json({
      status: 'success',
      data: {
        id: documentId,
        filename,
        originalName:
          originalname,
        size,
      },
    });

  } catch (error) {

    return next(error);
  }
};

/**
 * GET ALL DOCUMENTS
 */
const getAllDocuments = async (
  req,
  res
) => {

  try {

    const userId = req.user ? req.user.id : null;

    let result;
    if (userId) {
      result = await pool.query(`
        SELECT *
        FROM documents
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]);
    } else {
      result = await pool.query(`
        SELECT *
        FROM documents
        ORDER BY created_at DESC
      `);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        documents:
          result.rows.map(doc => ({
            id: doc.id,
            filename: doc.filename,
            originalName: doc.original_name,
            size: doc.size,
            userId: doc.user_id,
            createdAt: doc.created_at,
          })),
      },
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message:
        error.message,
    });
  }
};

/**
 * GET DOCUMENT BY ID
 */
const getDocumentById = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message:
          'Document not found',
      });
    }

    const document =
      result.rows[0];

    const filePath = path.join(
      process.cwd(),
      document.filepath
    );

    /**
     * FILE NOT FOUND
     */
    if (
      !fs.existsSync(filePath)
    ) {

      return res.status(404).json({
        status: 'failed',
        message:
          'File not found',
      });
    }

    /**
     * PDF RESPONSE
     */
    res.setHeader(
      'Content-Type',
      'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${document.original_name}"`
    );

    return res.sendFile(filePath);

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message:
        error.message,
    });
  }
};

/**
 * DELETE DOCUMENT
 */
const deleteDocument = async (
  req,
  res
) => {

  try {

    const { id } = req.params;
    const userId = req.user.id;

    const result =
      await pool.query(
        `
        DELETE FROM documents
        WHERE id = $1 AND user_id = $2
        RETURNING *
        `,
        [id, userId]
      );

    /**
     * DOCUMENT NOT FOUND
     */
    if (!result.rows.length) {

      return res.status(404).json({
        status: 'failed',
        message:
          'Document not found',
      });
    }

    const document =
      result.rows[0];

    /**
     * DELETE FILE
     */
    const filePath = path.join(
      process.cwd(),
      document.filepath
    );

    if (
      fs.existsSync(filePath)
    ) {

      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      status: 'success',
      message:
        'Document deleted successfully',
    });

  } catch (error) {

    return res.status(500).json({
      status: 'failed',
      message:
        error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
};