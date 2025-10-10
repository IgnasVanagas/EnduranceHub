const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Athlete = sequelize.define('Athlete', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  heightCm: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weightKg: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  restingHeartRate: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'athletes'
});

module.exports = {
  Athlete
};
