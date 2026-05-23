const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');

const {
  addBookmark,
  getBookmarks,
  getBookmarkById,
  deleteBookmark,
} = require('../handlers/bookmarksHandler');

// create
router.post(
  '/jobs/:jobId/bookmark',
  auth,
  addBookmark,
);

// get all
router.get(
  '/bookmarks',
  auth,
  getBookmarks,
);

// get by id
router.get(
  '/jobs/:jobId/bookmark/:id',
  auth,
  getBookmarkById,
);

// delete
router.delete(
  '/jobs/:jobId/bookmark',
  auth,
  deleteBookmark,
);

module.exports = router;