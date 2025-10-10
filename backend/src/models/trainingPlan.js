const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingPlan = sequelize.define('TrainingPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  athleteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  specialistId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  intensityLevel: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
    defaultValue: 'MEDIUM'
  }
}, {
  tableName: 'training_plans'
});

module.exports = {
  TrainingPlan
};
