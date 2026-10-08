const express = require('express');
const controller = require('../controllers/comments');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadComment } = require('../middleware/loaders');
const { commentSchema, commentCreateSchema } = require('../validators/comment');

// mergeParams: true, nes šis router'is prijungtas po /:categoryId/recipes/:recipeId
const router = express.Router({ mergeParams: true });

router.get('/', controller.list);
router.get('/:commentId', validateId('commentId'), loadComment, controller.getOne);
router.post('/', validate(commentCreateSchema), controller.create);
router.put('/:commentId', validateId('commentId'), loadComment, validate(commentSchema), controller.update);
router.delete('/:commentId', validateId('commentId'), loadComment, controller.remove);

module.exports = router;