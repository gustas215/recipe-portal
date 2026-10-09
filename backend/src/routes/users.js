const express = require('express');
const controller = require('../controllers/users');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { selfOrAdmin } = require('../middleware/ownership');
const validateId = require('../middleware/validateId');

const router = express.Router();

// Naudotojų sąrašas ir šalinimas: tik administratorius
router.get('/', authenticate, authorize('admin'), controller.list);
router.delete('/:userId', authenticate, authorize('admin'), validateId('userId'), controller.remove);

// Skydelyje yra el. paštas, todėl jį mato tik pats naudotojas arba administratorius
router.get(
  '/:userId/dashboard',
  authenticate,
  validateId('userId'),
  selfOrAdmin('userId'),
  controller.dashboard
);

module.exports = router;
