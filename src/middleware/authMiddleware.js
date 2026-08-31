// // src/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken')

// const protect = async (req, res, next) => {
//   let token

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       // Get token from header (removes 'Bearer ')
//       token = req.headers.authorization.split(' ')[1]

//       // Verify token using secret with fallback
//       const secret = process.env.JWT_SECRET || 'fallback_secret'
//       const decoded = jwt.verify(token, secret)

//       // FIX: Explicitly check for undefined or null so that an ID of 0
//       // (used for the system admin) is not treated as falsy/missing.
//       if (!decoded || decoded.id === undefined || decoded.id === null) {
//         return res.status(401).json({ error: 'Not authorized, invalid token payload' })
//       }

//       // Attach user to the request object
//       req.user = decoded

//       return next()
//     } catch (error) {
//       console.error('Token verification failed:', error.message)
//       return res.status(401).json({ error: 'Not authorized, token failed' })
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ error: 'Not authorized, no token provided' })
//   }
// }

// module.exports = { protect }



// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken')

const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (removes 'Bearer ')
      token = req.headers.authorization.split(' ')[1]

      // Verify token using secret with fallback
      const secret = process.env.JWT_SECRET || 'fallback_secret'
      const decoded = jwt.verify(token, secret)

      // Explicitly check for undefined or null so that an ID of 0 
      // (used for the system admin) is not treated as falsy/missing.
      if (!decoded || decoded.id === undefined || decoded.id === null) {
        return res.status(401).json({ error: 'Not authorized, invalid token payload' })
      }

      // Attach user to the request object
      req.user = decoded

      return next()
    } catch (error) {
      console.error('Token verification failed:', error.message)
      return res.status(401).json({ error: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' })
  }
}

// Flexible role authorization middleware that supports multiple roles (case-insensitive check)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user missing from request' })
    }

    // Normalize roles to uppercase to safely handle 'admin', 'ADMIN', 'tutor', 'TUTOR', etc.
    const userRole = (req.user.role || '').toUpperCase()
    const allowedRoles = roles.map(role => role.toUpperCase())

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      })
    }

    next()
  }
}

// Backward-compatible admin middleware using the new authorize factory
const isAdmin = authorize('ADMIN')

module.exports = { protect, authorize, isAdmin }