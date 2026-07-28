// const { Pool } = require('pg')
// require('dotenv').config()

// const pool = new Pool({
//   //   user: process.env.DB_USER,
//   //   host: process.env.DB_HOST,
//   //   database: process.env.DB_NAME,
//   //   password: process.env.DB_PASSWORD,
//   //   port: process.env.DB_PORT,

//   user: process.env.DB_USER,
//   host: process.env.DB_HOST || '127.0.0.1', // Explicitly use 127.0.0.1
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT || 5432,
// })

// pool.on('connect', () => {
//   console.log('📦 Connected to PostgreSQL Database')
// })

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   getClient: () => pool.connect(),
// }

const { Pool } = require('pg')
require('dotenv').config()

// DEBUG: Let's see what values are actually loading
console.log(
  'DEBUG DB CONFIG -> User:',
  process.env.DB_USER,
  '| Port:',
  process.env.DB_PORT,
  '| Password Length:',
  process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'UNDEFINED',
)

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
})

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL Database')
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}