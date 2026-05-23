const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const applicationSchema = require('../validations/applications');
const updateApplicationSchema = require('../validations/updateApplications');

const {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUser,
  getApplicationsByJob,
  updateApplication,
  deleteApplication,
} = require('../handlers/applicationsHandler');

router.post('/', auth, validate(applicationSchema), createApplication);

router.get('/', auth, getApplications);

router.get('/user/:userId', auth, getApplicationsByUser);

router.get('/job/:jobId', auth, getApplicationsByJob);

router.get('/:id', auth, getApplicationById);

router.put(
  '/:id',
  auth,
  validate(updateApplicationSchema),
  updateApplication
);

router.delete('/:id', auth, deleteApplication);

module.exports = router;