const Joi = require('joi');
const { TrainingPlan, Athlete, User, USER_ROLES } = require('../models');
const { notFound, unprocessableEntity } = require('../utils/httpError');

const planSchema = Joi.object({
  athleteId: Joi.number().integer().positive().required(),
  specialistId: Joi.number().integer().positive().optional(),
  title: Joi.string().max(255).required(),
  description: Joi.string().allow('', null).optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  intensityLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').required()
});

const updateSchema = planSchema.fork(['athleteId'], (schema) => schema.optional());

const toDto = (plan) => ({
  id: plan.id,
  athleteId: plan.athleteId,
  specialistId: plan.specialistId,
  title: plan.title,
  description: plan.description,
  startDate: plan.startDate,
  endDate: plan.endDate,
  intensityLevel: plan.intensityLevel,
  athlete: plan.athlete
    ? {
        id: plan.athlete.id,
        userId: plan.athlete.userId,
        user: plan.athlete.user
          ? {
              id: plan.athlete.user.id,
              email: plan.athlete.user.email,
              firstName: plan.athlete.user.firstName,
              lastName: plan.athlete.user.lastName
            }
          : undefined
      }
    : undefined,
  specialist: plan.specialist
    ? {
        id: plan.specialist.id,
        email: plan.specialist.email,
        firstName: plan.specialist.firstName,
        lastName: plan.specialist.lastName
      }
    : undefined
});

const ensureAccess = (req, plan) => {
  if (req.user.role === USER_ROLES.ADMIN) return true;
  if (req.user.role === USER_ROLES.SPECIALIST && plan.specialistId === req.user.id) return true;

  if (req.user.role === USER_ROLES.ATHLETE && plan.athlete && plan.athlete.userId === req.user.id) {
    return true;
  }

  return false;
};

const createPlan = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    const athlete = await Athlete.findByPk(payload.athleteId, {
      include: [{ model: User, as: 'user' }]
    });
    if (!athlete) {
      throw notFound('Athlete not found');
    }

    if (req.user.role === USER_ROLES.ATHLETE) {
      return res.status(403).json({ message: 'Athletes cannot create training plans' });
    }

    if (req.user.role === USER_ROLES.SPECIALIST) {
      payload.specialistId = req.user.id;
    }

    if (!payload.specialistId) {
      throw unprocessableEntity('specialistId is required');
    }

    const specialist = await User.findByPk(payload.specialistId);
    if (!specialist || specialist.role !== USER_ROLES.SPECIALIST) {
      throw unprocessableEntity('Invalid specialistId');
    }

    const plan = await TrainingPlan.create(payload);
    const fullPlan = await TrainingPlan.findByPk(plan.id, {
      include: [
        { model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'specialist' }
      ]
    });

    res.status(201).json({ trainingPlan: toDto(fullPlan) });
  } catch (error) {
    next(error);
  }
};

const listPlans = async (req, res, next) => {
  try {
    const where = {};
    const athleteInclude = { model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] };

    if (req.query.athleteId) {
      where.athleteId = req.query.athleteId;
    }

    if (req.query.specialistId && req.user.role === USER_ROLES.ADMIN) {
      where.specialistId = req.query.specialistId;
    }

    if (req.user.role === USER_ROLES.ATHLETE) {
      athleteInclude.where = { userId: req.user.id };
      athleteInclude.required = true;
    }

    if (req.user.role === USER_ROLES.SPECIALIST) {
      where.specialistId = req.user.id;
    }

    const plans = await TrainingPlan.findAll({
      where,
      include: [athleteInclude, { model: User, as: 'specialist' }]
    });

    res.json({ trainingPlans: plans.map((plan) => toDto(plan)) });
  } catch (error) {
    next(error);
  }
};

const getPlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findByPk(req.params.id, {
      include: [
        { model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'specialist' }
      ]
    });

    if (!plan) {
      throw notFound('Training plan not found');
    }

    if (!ensureAccess(req, plan)) {
      return res.status(403).json({ message: 'Insufficient permissions to view this plan' });
    }

    res.json({ trainingPlan: toDto(plan) });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findByPk(req.params.id, {
      include: [{ model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] }]
    });

    if (!plan) {
      throw notFound('Training plan not found');
    }

    if (!ensureAccess(req, plan)) {
      return res.status(403).json({ message: 'Insufficient permissions to update this plan' });
    }

    if (req.body.specialistId && req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Only administrators can reassign specialists' });
    }

    await plan.update(req.body);

    const reloaded = await TrainingPlan.findByPk(plan.id, {
      include: [
        { model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] },
        { model: User, as: 'specialist' }
      ]
    });

    res.json({ trainingPlan: toDto(reloaded) });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await TrainingPlan.findByPk(req.params.id, {
      include: [{ model: Athlete, as: 'athlete', include: [{ model: User, as: 'user' }] }]
    });

    if (!plan) {
      throw notFound('Training plan not found');
    }

    if (!ensureAccess(req, plan)) {
      return res.status(403).json({ message: 'Insufficient permissions to delete this plan' });
    }

    await plan.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  planSchema,
  updateSchema,
  createPlan,
  listPlans,
  getPlan,
  updatePlan,
  deletePlan
};
