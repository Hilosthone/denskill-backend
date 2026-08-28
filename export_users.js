// const { Pool } = require('pg')

// const localPool = new Pool({
//   connectionString: 'postgresql://postgres:admin123@127.0.0.1:5433/denskill_db',
// })

// async function exportUsers() {
//   try {
//     const res = await localPool.query('SELECT * FROM users;')
//     console.log(`Found ${res.rows.length} users!`)
//     console.log(JSON.stringify(res.rows, null, 2))

//     // Write it out to a file so you don't lose it
//     require('fs').writeFileSync(
//       'recovered_users.json',
//       JSON.stringify(res.rows, null, 2),
//     )
//     console.log('✅ Saved to recovered_users.json successfully!')
//   } catch (err) {
//     console.error('Error connecting to local DB:', err.message)
//   } finally {
//     await localPool.end()
//   }
// }

// exportUsers()

// const { Pool } = require('pg')
// require('dotenv').config()

// const localPool = new Pool({
//   connectionString: 'postgresql://postgres:admin123@127.0.0.1:5433/denskill_db',
// })

// const renderPool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// })

// const tables = [
//   'users',
//   'courses',
//   'enrollments',
//   'refresh_tokens',
//   'scholarship_cohorts',
//   'scholarship_applications',
//   'scholarship_awards',
//   'scholarship_payments',
//   'instructors',
//   'assessments',
//   'student_submissions',
//   'attendance_logs',
//   'course_modules',
//   'live_sessions',
//   'course_announcements',
//   'announcements',
// ]

// async function migrateAllData() {
//   try {
//     // Pre-flight check: Ensure schema is up to date and nullable where local data permits
//     console.log('🔧 Ensuring Render schema is up to date...')
//     await renderPool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255),
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255),
//         role VARCHAR(50) DEFAULT 'student',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//       ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
//     `)

//     for (const table of tables) {
//       console.log(`Fetching local data for table: ${table}...`)
//       const res = await localPool.query(`SELECT * FROM "${table}"`)
//       const rows = res.rows

//       if (rows.length === 0) {
//         console.log(`- Table ${table} is empty locally. Skipping.`)
//         continue
//       }

//       console.log(
//         `Found ${rows.length} rows in ${table}. Importing to Render...`,
//       )

//       for (const row of rows) {
//         const keys = Object.keys(row)
//         const values = Object.values(row)
//         const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
//         const columns = keys.map((k) => `"${k}"`).join(', ')

//         const query = `
//           INSERT INTO "${table}" (${columns})
//           VALUES (${placeholders})
//           OVERRIDING SYSTEM VALUE
//           ON CONFLICT DO NOTHING;
//         `

//         try {
//           await renderPool.query(query, values)
//         } catch (err) {
//           try {
//             const fallbackQuery = `
//               INSERT INTO "${table}" (${columns})
//               VALUES (${placeholders})
//               ON CONFLICT DO NOTHING;
//             `
//             await renderPool.query(fallbackQuery, values)
//           } catch (innerErr) {
//             console.warn(`⚠️ Skipped a row in ${table}:`, innerErr.message)
//           }
//         }
//       }
//       console.log(`✅ Successfully synced table: ${table}`)
//     }
//     console.log(
//       '🎉 All local tables and records have been successfully migrated to Render!',
//     )
//   } catch (err) {
//     console.error('❌ Migration error:', err.message)
//   } finally {
//     await localPool.end()
//     await renderPool.end()
//   }
// }

// migrateAllData()

const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function viewUsers() {
  try {
    const res = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC;',
    )
    console.log(`Total Users: ${res.rows.length}\n`)
    console.table(res.rows)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await pool.end()
  }
}

viewUsers()