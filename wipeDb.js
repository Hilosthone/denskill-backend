// wipeDb.js
const db = require('./src/config/db') // Adjust path to your db connection file

async function wipeDatabase() {
  try {
    console.log('Wiping database...')
    await db.query(
      'TRUNCATE TABLE enrollments, users RESTART IDENTITY CASCADE;',
    )
    console.log(
      'Database successfully wiped! All old users and enrollments have been cleared.',
    )
    process.exit(0)
  } catch (err) {
    console.error('Error wiping database:', err.message)
    process.exit(1)
  }
}

wipeDatabase()
