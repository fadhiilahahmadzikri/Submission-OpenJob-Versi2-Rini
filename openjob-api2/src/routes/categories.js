const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../handlers/categoriesHandler');

const validate = require('../middlewares/validate');
const categorySchema = require('../validations/categories');

router.post(
  '/',
  auth,
  validate(categorySchema),
  createCategory
);

router.get('/', getCategories);

router.get('/:id', getCategoryById);

router.put(
  '/:id',
  auth,
  validate(categorySchema),
  updateCategory
);

router.delete(
  '/:id',
  auth,
  deleteCategory
);

module.exports = router;