const express = require('express');

const router = express.Router();

const {
  registerUser,
  getUserById,
} = require('../handlers/usersHandler');

const validate = require('../middlewares/validate');
const userSchema = require('../validations/user');

router.post('/', validate(userSchema), registerUser);

router.get('/:id', getUserById);

module.exports = router;