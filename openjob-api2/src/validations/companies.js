const Joi = require('joi');

const companySchema = Joi.object({
  name: Joi.string().min(1).required(),
  location: Joi.string().min(1).required(),
  description: Joi.string().allow('', null).optional(),
}).unknown(true);

module.exports = companySchema;
