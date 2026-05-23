const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  role: Joi.string(),
});

module.exports = userSchema;