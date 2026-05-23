const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { jobSchema, jobUpdateSchema } = require('../validations/jobs');

const {
  createJob,
  getJobs,
  getJobById,
  getJobsByCompany,
  getJobsByCategory,
  updateJob,
  deleteJob,
} = require('../handlers/jobsHandler');

router.post('/', auth, validate(jobSchema), createJob);
router.get('/', getJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/category/:categoryId', getJobsByCategory);
router.get('/:id', getJobById);
router.put('/:id', auth, validate(jobUpdateSchema), updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;
