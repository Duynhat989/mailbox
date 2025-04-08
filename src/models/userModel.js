// models/userModel.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');

const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  BUSINESS: 'business',
  SERVICE: 'service',
  SELLER: 'seller'
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM(Object.values(ROLES)),
    defaultValue: ROLES.CUSTOMER
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = { User, ROLES };