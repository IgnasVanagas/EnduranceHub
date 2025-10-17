const Joi = require('joi');
const authService = require('../services/auth.service');
const { USER_ROLES } = require('../models');

const emailValidator = Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  .messages({
    'string.pattern.base': '"email" must be a valid email'
  });

const registerSchema = Joi.object({
  email: emailValidator.required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid(...Object.values(USER_ROLES)).optional(),
  athleteProfile: Joi.object({
    dateOfBirth: Joi.date().optional(),
    heightCm: Joi.number().integer().min(100).max(250).optional(),
    weightKg: Joi.number().min(30).max(250).optional(),
    restingHeartRate: Joi.number().integer().min(30).max(220).optional(),
    bio: Joi.string().max(1000).optional()
  }).optional()
});

const loginSchema = Joi.object({
  email: emailValidator.required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.revokeRefreshToken(req.body.refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  register,
  login,
  refresh,
  logout,
  me
};
