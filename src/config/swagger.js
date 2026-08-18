// // src/config/swagger.js
// const swaggerJSDoc = require('swagger-jsdoc')
// const swaggerUi = require('swagger-ui-express')

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'D Enskill Academy API Docs',
//       version: '1.0.0',
//       description:
//         'API documentation for D Enskill Academy backend admin, tutors, student portals, auth, and flutterwave payments by Hilosthone.',
//     },
//     servers: [
//       {
//         url: 'https://denskill-backend.onrender.com',
//         description: 'Production Server',
//       },
//       {
//         url: 'http://localhost:5000',
//         description: 'Development Server',
//       },
//     ],
//     // 👇 ADD THIS TAGS ARRAY HERE TO CONTROL THE EXACT ORDER
//     tags: [
//       {
//         name: 'System',
//         description: 'Liveness and readiness health checks',
//       },
//       {
//         name: 'Enrollments',
//         description: 'Student registration and payment flows',
//       },
//       {
//         name: 'Auth',
//         description: 'User authentication and account management',
//       },
//       {
//         name: 'Dashboard',
//         description: 'Student portal overview, courses, and assessments',
//       },
//       {
//         name: 'Admin Auth',
//         description: 'System administrator authentication',
//       },
//       {
//         name: 'Admin',
//         description: 'Platform management and oversight',
//       },
//       {
//         name: 'Tutor Auth',
//         description: 'Instructor authentication',
//       },
//       {
//         name: 'Tutor',
//         description: 'Instructor assessment, grading, and attendance portal',
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//     },
//   },
//   apis: ['./src/routes/*.js', './src/controllers/*.js'],
// }

// const swaggerSpec = swaggerJSDoc(options)

// const swaggerDocs = (app) => {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// }

// module.exports = { swaggerDocs }

// src/config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'D Enskill Academy API Docs',
      version: '1.0.0',
      description:
        'API documentation for D Enskill Academy backend admin, tutors, student portals, scholarship programme, auth, and flutterwave payments by Hilosthone.',
    },
    servers: [
      {
        url: 'https://denskill-backend.onrender.com',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    // Tags array to control the exact section ordering in Swagger UI
    tags: [
      {
        name: 'System',
        description: 'Liveness and readiness health checks',
      },
      {
        name: 'Auth',
        description: 'User authentication and account management',
      },
      {
        name: 'Dashboard',
        description: 'Student portal overview, courses, and assessments (Normal & Scholarship)',
      },
      {
        name: 'Enrollments',
        description: 'Student registration and payment flows',
      },
      {
        name: 'Scholarship Enrollment',
        description: 'Public scholarship applications and pre-admission tracking',
      },
      {
        name: 'Scholarship Auth',
        description: 'Scholarship applicant authentication',
      },
      {
        name: 'Admin Auth',
        description: 'System administrator authentication',
      },
      {
        name: 'Admin',
        description: 'Platform management, oversight, scholarship cohorts, and application reviews',
      },
      {
        name: 'Tutors',
        description: 'Instructor authentication, assessment, grading, attendance portal, and assigned cohort student tracking',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/routes/scholarship/*.js',
    './src/controllers/scholarship/*.js',
  ],
}

const swaggerSpec = swaggerJSDoc(options)

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

module.exports = { swaggerDocs }