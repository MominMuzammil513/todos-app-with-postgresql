const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
})
module.exports = pool
