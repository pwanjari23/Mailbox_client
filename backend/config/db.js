const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || 'mailbox_db';

let sequelize;

async function initializeDatabase() {
  try {
    // 1. Connect to MySQL without specifying a database first to ensure it exists
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass
    });

    console.log(`Connecting to MySQL at ${dbHost}:${dbPort}...`);
    
    // 2. Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" checked/created successfully.`);
    await connection.end();

    // 3. Create Sequelize instance
    sequelize = new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false, // Set to console.log to see SQL queries
    });

    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('Sequelize database connection established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  getSequelize: () => sequelize
};
