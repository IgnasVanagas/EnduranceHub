const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/message.controller');
const { USER_ROLES } = require('../models');

const router = express.Router();

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE));

router.post('/', validate(controller.createSchema), controller.createMessage);
router.get('/', controller.listMessages);
router.get('/:id', controller.getMessage);
router.patch('/:id/read', controller.markAsRead);
router.delete('/:id', controller.deleteMessage);

module.exports = router;
