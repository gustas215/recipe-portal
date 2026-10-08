const express = require('express');
const controller = require('../controllers/recipes');
const commentsRouter = require('./comments');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadRecipe } = require('../middleware/loaders');
const { recipeSchema, recipeCreateSchema } = require('../validators/recipe');

// mergeParams: true leidžia šiame router'yje matyti tėvinio maršruto :categoryId
const router = express.Router({ mergeParams: true });

router.get('/', controller.list);
router.get('/:recipeId', validateId('recipeId'), loadRecipe, controller.getOne);
router.post('/', validate(recipeCreateSchema), controller.create);
router.put('/:recipeId', validateId('recipeId'), loadRecipe, validate(recipeSchema), controller.update);
router.delete('/:recipeId', validateId('recipeId'), loadRecipe, controller.remove);

// Atsiliepimai yra recepto viduje: /categories/:categoryId/recipes/:recipeId/comments
router.use('/:recipeId/comments', validateId('recipeId'), loadRecipe, commentsRouter);

module.exports = router;