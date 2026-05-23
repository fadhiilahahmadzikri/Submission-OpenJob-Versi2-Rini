const express = require('express');

const router = express.Router();

const uploadMiddleware =
  require('../middlewares/uploadResume');

const auth =
  require('../middlewares/auth');

const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
} = require(
  '../handlers/documentsHandler'
);

/**
 * UPLOAD DOCUMENT
 */
router.post(
  '/',
  auth,
  uploadMiddleware.single('document'),
  uploadDocument
);

/**
 * GET ALL DOCUMENTS
 */
router.get(
  '/',
  getAllDocuments
);

/**
 * GET DOCUMENT BY ID
 */
router.get(
  '/:id',
  getDocumentById
);

/**
 * DELETE DOCUMENT
 */
router.delete(
  '/:id',
  auth,
  deleteDocument
);

module.exports = router;