const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/athlete.controller');
const trainingPlanController = require('../controllers/trainingPlan.controller');
const nutritionPlanController = require('../controllers/nutritionPlan.controller');
const { USER_ROLES } = require('../models');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(USER_ROLES.ADMIN), validate(controller.athleteSchema), controller.createAthlete);
router.get('/', controller.listAthletes);
router.get('/:id', controller.getAthlete);
router.get(
  '/:id/training-plans',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE),
  (req, res, next) => {
    req.query = { ...req.query, athleteId: req.params.id };
    return trainingPlanController.listPlans(req, res, next);
  }
);
router.get(
  '/:id/nutrition-plans',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE),
  (req, res, next) => {
    req.query = { ...req.query, athleteId: req.params.id };
    return nutritionPlanController.listPlans(req, res, next);
  }
);
router.put(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SPECIALIST, USER_ROLES.ATHLETE),
  validate(controller.updateSchema),
  controller.updateAthlete
);
router.delete('/:id', authorize(USER_ROLES.ADMIN), controller.deleteAthlete);

module.exports = router;
