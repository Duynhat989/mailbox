// config/config.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mailserver',
  process.env.DB_USER || 'mailuser',
  process.env.DB_PASSWORD || 'mailpassword',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with database
    // Note: Use {force: true} only in development to drop existing tables
    const syncOptions = process.env.NODE_ENV === 'development' && process.env.DB_SYNC_FORCE === 'true' 
      ? { force: true } 
      : { alter: true };
    
    await sequelize.sync({});
    console.log('All models were synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  initializeDatabase
};