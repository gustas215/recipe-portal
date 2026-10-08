const express = require('express');
const controller = require('../controllers/users');
const validateId = require('../middleware/validateId');

const router = express.Router();

router.get('/', controller.list);
router.get('/:userId/dashboard', validateId('userId'), controller.dashboard);
router.delete('/:userId', validateId('userId'), controller.remove);

module.exports = router;