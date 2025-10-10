const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Athlete, RefreshToken, USER_ROLES } = require('../models');
const config = require('../config/vars');
const { conflict, unauthorized, notFound } = require('../utils/httpError');

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

const persistRefreshToken = async (userId) => {
  const token = jwt.sign({ sub: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
  const payload = jwt.decode(token);
  const expiresAt = payload && payload.exp ? new Date(payload.exp * 1000) : null;

  const refreshToken = await RefreshToken.create({
    userId,
    token,
    expiresAt
  });

  return refreshToken.token;
};

const register = async ({ email, password, firstName, lastName, role = USER_ROLES.ATHLETE, athleteProfile }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw conflict('Email is already registered');
  }

  if (!Object.values(USER_ROLES).includes(role)) {
    role = USER_ROLES.ATHLETE;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role
  });

  if (role === USER_ROLES.ATHLETE) {
    await Athlete.create({
      userId: user.id,
      ...athleteProfile
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await persistRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw unauthorized('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw unauthorized('Invalid credentials');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await persistRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const refresh = async (token) => {
  if (!token) {
    throw unauthorized('Refresh token required');
  }

  const stored = await RefreshToken.findOne({ where: { token, isRevoked: false } });
  if (!stored) {
    throw unauthorized('Refresh token not found');
  }

  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret);
    if (stored.expiresAt && stored.expiresAt < new Date()) {
      stored.isRevoked = true;
      await stored.save();
      throw unauthorized('Refresh token expired');
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw notFound('User not found');
    }

    stored.isRevoked = true;
    await stored.save();

    const accessToken = generateAccessToken(user);
    const newRefreshToken = await persistRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw unauthorized('Invalid refresh token');
  }
};

const revokeRefreshToken = async (token) => {
  if (!token) return;
  const stored = await RefreshToken.findOne({ where: { token } });
  if (stored) {
    stored.isRevoked = true;
    await stored.save();
  }
};

module.exports = {
  register,
  login,
  refresh,
  revokeRefreshToken
};
