const express = require('express');
const controller = require('../controllers/recipes');
const commentsRouter = require('./comments');
const authenticate = require('../middleware/authenticate');
const { onlyOwner, ownerOrAdmin } = require('../middleware/ownership');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadRecipe } = require('../middleware/loaders');
const { recipeSchema } = require('../validators/recipe');

// mergeParams: true leidžia šiame router'yje matyti tėvinio maršruto :categoryId
const router = express.Router({ mergeParams: true });

router.get('/', controller.list);
router.get('/:recipeId', validateId('recipeId'), loadRecipe, controller.getOne);

// Tvarka: authenticate (401) -> ID (400) -> loaderis (404) -> nuosavybė (403) -> validacija (422)
router.post('/', authenticate, validate(recipeSchema), controller.create);
router.put(
  '/:recipeId',
  authenticate,
  validateId('recipeId'),
  loadRecipe,
  onlyOwner('recipe'),
  validate(recipeSchema),
  controller.update
);
router.delete(
  '/:recipeId',
  authenticate,
  validateId('recipeId'),
  loadRecipe,
  ownerOrAdmin('recipe'),
  controller.remove
);

// Atsiliepimai yra recepto viduje: /categories/:categoryId/recipes/:recipeId/comments
router.use('/:recipeId/comments', validateId('recipeId'), loadRecipe, commentsRouter);

module.exports = router;