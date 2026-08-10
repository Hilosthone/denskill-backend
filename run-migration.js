const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

async function runMigration() {
  const filePath = path.join(
    __dirname,
    'src/database/migrations/003_grading_and_attendance.sql',
  )
  const sql = fs.readFileSync(filePath, 'utf8')

  try {
    console.log('Running migration...')
    await pool.query(sql)
    console.log('Migration completed successfully! Tables created.')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await pool.end()
  }
}

runMigration()
