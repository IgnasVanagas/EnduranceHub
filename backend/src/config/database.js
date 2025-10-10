const { Sequelize } = require('sequelize');
const config = require('./vars');

const sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
  host: config.database.host,
  port: config.database.port,
  dialect: 'mysql',
  logging: config.env === 'development' ? console.log : false,
  define: {
    underscored: true
  }
});

module.exports = sequelize;
