const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');

const {
  getProfile,
  getProfileApplications,
  getProfileBookmarks,
} = require('../handlers/profileHandler');

router.get(
  '/',
  auth,
  getProfile
);

router.get(
  '/applications',
  auth,
  getProfileApplications
);

router.get(
  '/bookmarks',
  auth,
  getProfileBookmarks
);

module.exports = router;