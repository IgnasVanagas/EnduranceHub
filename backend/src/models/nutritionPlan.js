const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NutritionPlan = sequelize.define('NutritionPlan', {
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
  caloriesPerDay: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  macronutrientRatio: {
    type: DataTypes.JSON,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'nutrition_plans'
});

module.exports = {
  NutritionPlan
};
