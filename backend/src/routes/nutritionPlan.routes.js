const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/nutritionPlan.controller');
const { USER_ROLES } = require('../models');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST), validate(controller.planSchema), controller.createPlan);
router.get('/', authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE), controller.listPlans);
router.get('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE), controller.getPlan);
router.put(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST),
  validate(controller.updateSchema),
  controller.updatePlan
);
router.delete('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST), controller.deletePlan);

module.exports = router;
