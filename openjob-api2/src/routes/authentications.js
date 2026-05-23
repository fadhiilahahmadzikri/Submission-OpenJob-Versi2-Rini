const express = require('express');

const router = express.Router();

const {
  loginUser,
  refreshAuthentication,
  logoutUser,
} = require('../handlers/authenticationsHandler');

const validate = require('../middlewares/validate');
const authentication = require('../middlewares/auth');

const authSchema = require('../validations/authentications');
const refreshTokenSchema = require('../validations/refreshToken');

// Login
router.post(
  '/',
  validate(authSchema),
  loginUser
);

// Refresh access token
router.put(
  '/',
  validate(refreshTokenSchema),
  refreshAuthentication
);

// Logout
router.delete(
  '/',
  authentication,
  validate(refreshTokenSchema),
  logoutUser
);

module.exports = router;