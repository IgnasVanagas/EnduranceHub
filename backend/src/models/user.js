const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const USER_ROLES = {
  ATHLETE: 'ATHLETE',
  SPECIALIST: 'SPECIALIST',
  ADMIN: 'ADMIN'
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(...Object.values(USER_ROLES)),
    allowNull: false,
    defaultValue: USER_ROLES.ATHLETE
  }
}, {
  tableName: 'users'
});

module.exports = {
  User,
  USER_ROLES
};
