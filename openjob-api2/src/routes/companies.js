const express = require('express');

const router = express.Router();

const auth =
  require('../middlewares/auth');

const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require(
  '../handlers/companiesHandler'
);

const validate = require('../middlewares/validate');
const companySchema = require('../validations/companies');

/**
 * CREATE COMPANY
 */
router.post(
  '/',
  auth,
  validate(companySchema),
  createCompany
);

/**
 * GET ALL COMPANIES
 */
router.get(
  '/',
  getCompanies
);

/**
 * GET COMPANY BY ID
 */
router.get(
  '/:id',
  getCompanyById
);

/**
 * UPDATE COMPANY
 */
router.put(
  '/:id',
  auth,
  updateCompany
);

/**
 * DELETE COMPANY
 */
router.delete(
  '/:id',
  auth,
  deleteCompany
);

module.exports = router;