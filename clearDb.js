//src/server.js
// clearDb.js
// This script is intended to be run from the command line to clear the database.
const db = require('./src/config/db')

async function clearDatabase() {
  try {
    await db.query(
      'TRUNCATE TABLE users, enrollments RESTART IDENTITY CASCADE;',
    )
    console.log('Database successfully wiped and reset!')
    process.exit(0)
  } catch (err) {
    console.error('Error clearing database:', err.message)
    process.exit(1)
  }
}

clearDatabase()
