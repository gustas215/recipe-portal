const express = require('express');
const controller = require('../controllers/categories');
const recipesRouter = require('./recipes');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadCategory } = require('../middleware/loaders');
const { categorySchema } = require('../validators/category');

const router = express.Router();

router.get('/', controller.list);
router.get('/:categoryId', validateId('categoryId'), controller.getOne);
router.post('/', validate(categorySchema), controller.create);
router.put('/:categoryId', validateId('categoryId'), validate(categorySchema), controller.update);
router.delete('/:categoryId', validateId('categoryId'), controller.remove);

// Receptai yra kategorijos viduje: /categories/:categoryId/recipes
// Pirma tikrinamas ID, tada ar kategorija egzistuoja, ir tik tada pasiekiami receptų maršrutai
router.use('/:categoryId/recipes', validateId('categoryId'), loadCategory, recipesRouter);

module.exports = router;