const Joi = require('joi');

const applicationSchema = Joi.object({
  job_id: Joi.string().min(1).required(),

  status: Joi.string().optional(),
}).unknown(true);

module.exports = applicationSchema;