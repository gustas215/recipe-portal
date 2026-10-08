const express = require('express');
const controller = require('../controllers/categories');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { categorySchema } = require('../validators/category');

const router = express.Router();

router.get('/', controller.list);
router.get('/:categoryId', validateId('categoryId'), controller.getOne);
router.post('/', validate(categorySchema), controller.create);
router.put('/:categoryId', validateId('categoryId'), validate(categorySchema), controller.update);
router.delete('/:categoryId', validateId('categoryId'), controller.remove);

module.exports = router;