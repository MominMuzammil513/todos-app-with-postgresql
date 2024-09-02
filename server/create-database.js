const { Client } = require('pg');
require('dotenv').config()
// Create a new client
const client = new Client({
  user: process.env.USER_NAME,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
});

async function createDatabase() {
  try {
    // Connect to PostgreSQL
    await client.connect();
    
    // Create database if it does not exist
    await client.query('CREATE DATABASE todoapp');
    
    console.log('Database created successfully.');
  } catch (err) {
    if (err.code === '42P04') {
      // Database already exists
      console.log('Database already exists.');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    // Disconnect the client
    await client.end();
  }
}

createDatabase();
