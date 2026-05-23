const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('', null).optional(),
  company_id: Joi.string().min(1).required(),
  category_id: Joi.string().min(1).required(),
}).unknown(true);

const jobUpdateSchema = Joi.object({
  title: Joi.string().min(1).optional(),
  description: Joi.string().allow('', null).optional(),
  company_id: Joi.string().min(1).optional(),
  category_id: Joi.string().min(1).optional(),
}).unknown(true);

module.exports = { jobSchema, jobUpdateSchema };
