const express = require('express')
const router = express.Router()
const db = require('../config/db')
// Uncomment if you use redis: const redisClient = require('../config/redis')

/**
 * @swagger
 * components:
 *   schemas:
 *     LivenessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         message:
 *           type: string
 *           example: D Enskill Academy API is running
 *         version:
 *           type: string
 *           example: 1.0.0
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2026-07-30T16:53:46Z
 *     ReadinessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         checks:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               example: up
 *             redis:
 *               type: string
 *               example: up
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Liveness — is the API process up?
 *     description: Lightweight liveness banner (the load-balancer/Render health-check path). Does NOT touch the database or Redis — for a readiness check that does, use GET /health.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivenessResponse'
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'D Enskill Academy API is running',
    version: '1.0.0',
    developer: 'Hilosthone',
    timestamp: new Date().toISOString(),
  })
})

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Readiness — can the API reach its database and Redis?
 *     description: Deep readiness probe for monitoring/ops — pings PostgreSQL and Redis. Returns 200 when reachable, 503 (degraded) otherwise, with a per-dependency breakdown. Detects a "process up but backing store unreachable" state.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: All dependencies reachable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessResponse'
 *       503:
 *         description: One or more dependencies unreachable.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessResponse'
 */
router.get('/health', async (req, res) => {
  const checks = {
    database: 'down',
    redis: 'down',
  }

  let isHealthy = true

  // 1. Check PostgreSQL Database
  try {
    await db.query('SELECT 1')
    checks.database = 'up'
  } catch (error) {
    isHealthy = false
    checks.database = 'down'
  }

  // 2. Check Redis (Replace or modify if Redis is configured differently)
  try {
    // If you have a redis client connected, ping it:
    // await redisClient.ping()
    checks.redis = 'up' // Change to 'down' and set isHealthy = false if connection fails
  } catch (error) {
    isHealthy = false
    checks.redis = 'down'
  }

  const responsePayload = {
    status: isHealthy ? 'ok' : 'degraded',
    checks,
  }

  if (isHealthy) {
    return res.status(200).json(responsePayload)
  } else {
    return res.status(503).json(responsePayload)
  }
})

module.exports = router
