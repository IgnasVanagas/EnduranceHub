const sequelize = require('../config/database');
const { User, USER_ROLES } = require('./user');
const { Athlete } = require('./athlete');
const { TrainingPlan } = require('./trainingPlan');
const { NutritionPlan } = require('./nutritionPlan');
const { RefreshToken } = require('./refreshToken');
const { Message } = require('./message');

User.hasOne(Athlete, {
  foreignKey: 'userId',
  as: 'athleteProfile',
  onDelete: 'CASCADE'
});
Athlete.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Athlete.hasMany(TrainingPlan, {
  foreignKey: 'athleteId',
  as: 'trainingPlans',
  onDelete: 'CASCADE'
});
TrainingPlan.belongsTo(Athlete, {
  foreignKey: 'athleteId',
  as: 'athlete'
});
TrainingPlan.belongsTo(User, {
  foreignKey: 'specialistId',
  as: 'specialist'
});

Athlete.hasMany(NutritionPlan, {
  foreignKey: 'athleteId',
  as: 'nutritionPlans',
  onDelete: 'CASCADE'
});
NutritionPlan.belongsTo(Athlete, {
  foreignKey: 'athleteId',
  as: 'athlete'
});
NutritionPlan.belongsTo(User, {
  foreignKey: 'specialistId',
  as: 'specialist'
});

User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
  onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  USER_ROLES,
  Athlete,
  TrainingPlan,
  NutritionPlan,
  RefreshToken,
  Message
};
