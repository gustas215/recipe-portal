const express = require('express');
const controller = require('../controllers/categories');
const recipesRouter = require('./recipes');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadCategory } = require('../middleware/loaders');
const { categorySchema } = require('../validators/category');

const router = express.Router();

router.get('/', controller.list);
router.get('/:categoryId', validateId('categoryId'), controller.getOne);

// Kategorijas tvarko tik administratorius.
// Tvarka: authenticate (401) -> authorize (403) -> ID (400) -> validacija (422) -> kontroleris
router.post('/', authenticate, authorize('admin'), validate(categorySchema), controller.create);
router.put(
  '/:categoryId',
  authenticate,
  authorize('admin'),
  validateId('categoryId'),
  validate(categorySchema),
  controller.update
);
router.delete(
  '/:categoryId',
  authenticate,
  authorize('admin'),
  validateId('categoryId'),
  controller.remove
);

// Receptai yra kategorijos viduje: /categories/:categoryId/recipes
// Pirma tikrinamas ID, tada ar kategorija egzistuoja, ir tik tada pasiekiami receptų maršrutai
router.use('/:categoryId/recipes', validateId('categoryId'), loadCategory, recipesRouter);

module.exports = router;
