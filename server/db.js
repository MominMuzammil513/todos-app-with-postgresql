const { Pool } = require('pg')
// require('dotenv').config()

const pool = new Pool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    database: process.envDB_NAME,
})

module.exports = pool
