const express = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerSchema, loginSchema } = require('../validators/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
