const cron = require('node-cron')
const db = require('../config/db')

const cleanExpiredRefreshTokens = async () => {
  try {
    const result = await db.query(
      'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP',
    )
    if (result.rowCount > 0) {
      console.log(
        `🧹 Cleaned up ${result.rowCount} expired refresh token(s) from database.`,
      )
    }
  } catch (err) {
    console.error('Error cleaning up expired refresh tokens:', err.message)
  }
}

const initTokenCleanupCron = () => {
  // Run immediately when server boots up
  cleanExpiredRefreshTokens()

  // Schedule to run every day at midnight ('0 0 * * *')
  cron.schedule('0 0 * * *', () => {
    cleanExpiredRefreshTokens()
  })
}

module.exports = { initTokenCleanupCron, cleanExpiredRefreshTokens }
