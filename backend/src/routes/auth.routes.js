const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validate(authController.registerSchema), authController.register);
router.post('/login', validate(authController.loginSchema), authController.login);
router.post('/refresh', validate(authController.refreshSchema), authController.refresh);
router.post('/logout', validate(authController.refreshSchema), authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
