const Joi = require('joi');
const { Athlete, User, TrainingPlan, NutritionPlan, USER_ROLES } = require('../models');
const { notFound, conflict, unprocessableEntity } = require('../utils/httpError');

const athleteSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  dateOfBirth: Joi.date().optional(),
  heightCm: Joi.number().integer().min(100).max(250).optional(),
  weightKg: Joi.number().min(30).max(250).optional(),
  restingHeartRate: Joi.number().integer().min(30).max(220).optional(),
  bio: Joi.string().max(1000).optional()
});

const updateSchema = athleteSchema.fork(['userId'], (schema) => schema.forbidden());

const toDto = (athlete) => ({
  id: athlete.id,
  userId: athlete.userId,
  dateOfBirth: athlete.dateOfBirth,
  heightCm: athlete.heightCm,
  weightKg: athlete.weightKg,
  restingHeartRate: athlete.restingHeartRate,
  bio: athlete.bio,
  user: athlete.user
    ? {
        id: athlete.user.id,
        email: athlete.user.email,
        firstName: athlete.user.firstName,
        lastName: athlete.user.lastName,
        role: athlete.user.role
      }
    : undefined,
  trainingPlans: athlete.trainingPlans,
  nutritionPlans: athlete.nutritionPlans
});

const createAthlete = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw notFound('User not found');
    }

    if (user.role !== USER_ROLES.ATHLETE) {
      throw unprocessableEntity('User role must be ATHLETE to create an athlete profile');
    }

    const existing = await Athlete.findOne({ where: { userId: payload.userId } });
    if (existing) {
      throw conflict('Athlete profile already exists for this user');
    }

    const athlete = await Athlete.create(payload);
    const fullAthlete = await Athlete.findByPk(athlete.id, {
      include: [{ model: User, as: 'user' }]
    });

    res.status(201).json({ athlete: toDto(fullAthlete) });
  } catch (error) {
    next(error);
  }
};

const listAthletes = async (req, res, next) => {
  try {
    const filters = {};

    if (req.user.role === USER_ROLES.ATHLETE) {
      filters.userId = req.user.id;
    } else if (req.query.userId) {
      filters.userId = req.query.userId;
    }

    const athletes = await Athlete.findAll({
      where: filters,
      include: [{ model: User, as: 'user' }]
    });
    res.json({ athletes: athletes.map((athlete) => toDto(athlete)) });
  } catch (error) {
    next(error);
  }
};

const getAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: TrainingPlan, as: 'trainingPlans' },
        { model: NutritionPlan, as: 'nutritionPlans' }
      ]
    });

    if (!athlete) {
      throw notFound('Athlete not found');
    }

    if (req.user.role === USER_ROLES.ATHLETE && athlete.userId !== req.user.id) {
      return res.status(403).json({ message: 'Cannot access another athlete profile' });
    }

    res.json({ athlete: toDto(athlete) });
  } catch (error) {
    next(error);
  }
};

const updateAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id);

    if (!athlete) {
      throw notFound('Athlete not found');
    }

    if (req.user.role === USER_ROLES.ATHLETE && athlete.userId !== req.user.id) {
      return res.status(403).json({ message: 'Cannot update another athlete profile' });
    }

    await athlete.update(req.body);
    const updated = await Athlete.findByPk(athlete.id, {
      include: [{ model: User, as: 'user' }]
    });

    res.json({ athlete: toDto(updated) });
  } catch (error) {
    next(error);
  }
};

const deleteAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findByPk(req.params.id);

    if (!athlete) {
      throw notFound('Athlete not found');
    }

    await athlete.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  athleteSchema,
  updateSchema,
  createAthlete,
  listAthletes,
  getAthlete,
  updateAthlete,
  deleteAthlete
};
