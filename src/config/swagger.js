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
//         'API documentation for D Enskill Academy backend admin, tutors, student portals, scholarship programme, auth, and flutterwave payments by Hilosthone.',
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
//     // Tags array to control the exact section ordering in Swagger UI
//     tags: [
//       {
//         name: 'System',
//         description: 'Liveness and readiness health checks',
//       },
//       {
//         name: 'Auth',
//         description: 'User authentication and account management',
//       },
//       {
//         name: 'Dashboard',
//         description: 'Student portal overview, courses, and assessments (Normal & Scholarship)',
//       },
//       {
//         name: 'Enrollments',
//         description: 'Student registration and payment flows',
//       },
//       {
//         name: 'Scholarship Enrollment',
//         description: 'Public scholarship applications and pre-admission tracking',
//       },
//       {
//         name: 'Scholarship Auth',
//         description: 'Scholarship applicant authentication',
//       },
//       {
//         name: 'Admin Auth',
//         description: 'System administrator authentication',
//       },
//       {
//         name: 'Admin',
//         description: 'Platform management, oversight, scholarship cohorts, and application reviews',
//       },
//       {
//         name: 'Tutors',
//         description: 'Instructor authentication, assessment, grading, attendance portal, and assigned cohort student tracking',
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
//   apis: [
//     './src/routes/*.js',
//     './src/controllers/*.js',
//     './src/routes/scholarship/*.js',
//     './src/controllers/scholarship/*.js',
//   ],
// }

// const swaggerSpec = swaggerJSDoc(options)

// const swaggerDocs = (app) => {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
// }

// module.exports = { swaggerDocs }



// // src/config/swagger.js
// const swaggerJSDoc = require('swagger-jsdoc')

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'D Enskill Academy API Docs',
//       version: '1.0.0',
//       description:
//         'API documentation for D Enskill Academy backend admin, tutors, student portals, scholarship programme, auth, and flutterwave payments by Hilosthone.',
//     },
//     servers: [
//       {
//         url: 'https://denskill-backend.onrender.com',
//         description: 'Production Server (Render)',
//       },
//       {
//         url: 'http://localhost:5000',
//         description: 'Development Server',
//       },
//     ],
//     tags: [
//       { name: 'System', description: 'Liveness and readiness health checks' },
//       { name: 'Auth', description: 'User authentication and account management' },
//       { name: 'Dashboard', description: 'Student portal overview, courses, and assessments (Normal & Scholarship)' },
//       { name: 'Enrollments', description: 'Student registration and payment flows' },
//       { name: 'Scholarship Enrollment', description: 'Public scholarship applications and pre-admission tracking' },
//       { name: 'Scholarship Auth', description: 'Scholarship applicant authentication' },
//       { name: 'Admin Auth', description: 'System administrator authentication' },
//       { name: 'Admin', description: 'Platform management, oversight, scholarship cohorts, and application reviews' },
//       { name: 'Tutors', description: 'Instructor authentication, assessment, grading, attendance portal, and assigned cohort student tracking' },
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
//   apis: [
//     './src/routes/*.js',
//     './src/controllers/*.js',
//     './src/routes/scholarship/*.js',
//     './src/controllers/scholarship/*.js',
//   ],
// }

// const swaggerSpec = swaggerJSDoc(options)

// const swaggerDocs = (app) => {
//   // Serve raw JSON spec
//   app.get('/api-docs.json', (req, res) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.send(swaggerSpec)
//   })

//   // Serve Swagger UI HTML using official CDN assets
//   app.get('/api-docs', (req, res) => {
//     res.send(`
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <title>D Enskill Academy API Docs</title>
//         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css" />
//         <style>
//           html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
//           *, *:before, *:after { box-sizing: inherit; }
//           body { margin: 0; background: #fafafa; }
//         </style>
//       </head>
//       <body>
//         <div id="swagger-ui"></div>
//         <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js"></script>
//         <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"></script>
//         <script>
//           window.onload = function() {
//             window.ui = SwaggerUIBundle({
//               url: '/api-docs.json',
//               dom_id: '#swagger-ui',
//               presets: [
//                 SwaggerUIBundle.presets.apis,
//                 SwaggerUIStandalonePreset
//               ],
//               layout: "StandaloneLayout"
//             });
//           };
//         </script>
//       </body>
//       </html>
//     `)
//   })
// }

// module.exports = { swaggerDocs }


// src/config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc')
const path = require('path')

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
        description: 'Production Server (Render)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'System', description: 'Liveness and readiness health checks' },
      { name: 'Auth', description: 'User authentication and account management' },
      { name: 'Dashboard', description: 'Student portal overview, courses, and assessments (Normal & Scholarship)' },
      { name: 'Enrollments', description: 'Student registration and payment flows' },
      { name: 'Scholarship Enrollment', description: 'Public scholarship applications and pre-admission tracking' },
      { name: 'Scholarship Auth', description: 'Scholarship applicant authentication' },
      { name: 'Admin Auth', description: 'System administrator authentication' },
      { name: 'Admin', description: 'Platform management, oversight, scholarship cohorts, and application reviews' },
      { name: 'Tutors', description: 'Instructor authentication, assessment, grading, attendance portal, and assigned cohort student tracking' },
      { name: 'Scholarship Admin', description: 'Platform management, scholarship cohort creation, application reviews, and manual onboarding' },
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
    // Removed global security array here so public routes (like login) won't be incorrectly locked down.
    // Instead, specify `security: [{ bearerAuth: [] }]` only on protected routes in your JSDoc blocks.
  },
  apis: [
    path.join(__dirname, '../routes/**/*.js'),      // Recursively scans all subfolders in routes
    path.join(__dirname, '../controllers/**/*.js'), // Recursively scans all subfolders in controllers
  ],
}

const swaggerSpec = swaggerJSDoc(options)

const swaggerDocs = (app) => {
  // Serve raw JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  // Serve Swagger UI HTML using official CDN assets
  app.get('/api-docs', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>D Enskill Academy API Docs</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css" />
        <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/favicon-16x16.png" sizes="16x16" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: '/api-docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
      </html>
    `)
  })
}

module.exports = { swaggerDocs }