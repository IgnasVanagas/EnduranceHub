const express = require('express');
const authRoutes = require('./auth.routes');
const athleteRoutes = require('./athlete.routes');
const trainingPlanRoutes = require('./trainingPlan.routes');
const nutritionPlanRoutes = require('./nutritionPlan.routes');
const messageRoutes = require('./message.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/athletes', athleteRoutes);
router.use('/training-plans', trainingPlanRoutes);
router.use('/nutrition-plans', nutritionPlanRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
