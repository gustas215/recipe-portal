const express = require('express');
const controller = require('../controllers/comments');
const authenticate = require('../middleware/authenticate');
const { onlyOwner, ownerOrAdmin } = require('../middleware/ownership');
const validateId = require('../middleware/validateId');
const validate = require('../middleware/validate');
const { loadComment } = require('../middleware/loaders');
const { commentSchema } = require('../validators/comment');

// mergeParams: true, nes šis router'is prijungtas po /:categoryId/recipes/:recipeId
const router = express.Router({ mergeParams: true });

router.get('/', controller.list);
router.get('/:commentId', validateId('commentId'), loadComment, controller.getOne);

// Tvarka: authenticate (401) -> ID (400) -> loaderis (404) -> nuosavybė (403) -> validacija (422)
// POST: recepto autoriaus (403) ir pasikartojančio atsiliepimo (409) patikros yra kontroleryje
router.post('/', authenticate, validate(commentSchema), controller.create);
router.put(
  '/:commentId',
  authenticate,
  validateId('commentId'),
  loadComment,
  onlyOwner('comment'),
  validate(commentSchema),
  controller.update
);
router.delete(
  '/:commentId',
  authenticate,
  validateId('commentId'),
  loadComment,
  ownerOrAdmin('comment'),
  controller.remove
);

module.exports = router;
