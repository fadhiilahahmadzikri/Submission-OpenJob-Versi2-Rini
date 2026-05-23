const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().min(1).required(),
}).unknown(true);

module.exports = categorySchema.unknown(true);