const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'messages'
});

module.exports = {
  Message
};
