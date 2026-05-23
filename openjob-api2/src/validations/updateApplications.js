const Joi = require('joi');

const updateApplicationSchema = Joi.object({
  cover_letter: Joi.string().optional(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').optional(),
});

module.exports = updateApplicationSchema;