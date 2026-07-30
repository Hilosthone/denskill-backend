const express = require('express')
const router = express.Router()
const { adminLogin } = require('../controllers/adminController')

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Authenticate system administrator
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminLogin)

module.exports = router
