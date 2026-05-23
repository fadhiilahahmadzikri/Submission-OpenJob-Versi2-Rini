const express = require('express');

const { UserSchema } =
  require('../../validator/users');

module.exports = (usersService) => {

  const router = express.Router();

  /**
   * GET USERS
   */
  router.get('/', async (req, res) => {
    try {

      const users =
        await usersService.getUsers();

      res.status(200).json({
        status: 'success',
        data: users,
      });

    } catch (error) {

      res.status(500).json({
        status: 'error',
        message: error.message,
      });

    }
  });

  /**
   * REGISTER USER
   */
  router.post('/', async (req, res) => {
    try {

      /**
       * VALIDATION
       */
      const { error } =
        UserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'failed',
          message:
            error.details[0].message,
        });
      }

      const {
        username,
        password,
        name,
      } = req.body;

      /**
       * CREATE USER
       */
      const newUser =
        await usersService.addUser({
          username,
          password,
          name,
        });

      /**
       * SUCCESS RESPONSE
       */
      res.status(201).json({
        status: 'success',
        data: {
          userId:
            newUser.id || newUser,
        },
      });

    } catch (error) {

      res.status(500).json({
        status: 'error',
        message: error.message,
      });

    }
  });

  return router;
};