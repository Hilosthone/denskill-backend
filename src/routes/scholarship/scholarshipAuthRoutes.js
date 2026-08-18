const express = require('express')
const router = express.Router()
const scholarshipAuthController = require('../../controllers/scholarship/scholarshipAuthController')

router.post('/login', scholarshipAuthController.scholarshipLogin)

module.exports = router
