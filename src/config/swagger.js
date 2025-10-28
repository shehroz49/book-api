const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API Documentation',
      version: '1.0.0',
      description: 'Kitoblarni boshqarish uchun REST API. Email orqali ro\'yxatdan o\'tish, JWT autentifikatsiya va kitoblar uchun CRUD operatsiyalari.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'https://book-api-production-a8c4.up.railway.app',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token orqali autentifikatsiya. Login yoki Register dan token oling va "Bearer YOUR_TOKEN" formatida kiriting.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Foydalanuvchi ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Foydalanuvchi emaili'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Yaratilgan vaqt'
            }
          }
        },
        Book: {
          type: 'object',
          required: ['name', 'description', 'image'],
          properties: {
            _id: {
              type: 'string',
              description: 'Kitob ID'
            },
            name: {
              type: 'string',
              description: 'Kitob nomi',
              maxLength: 200
            },
            description: {
              type: 'string',
              description: 'Kitob haqida ma\'lumot',
              maxLength: 2000
            },
            image: {
              type: 'string',
              description: 'Kitob rasmi URL'
            },
            user: {
              type: 'string',
              description: 'Kitob egasi (User ID)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Yaratilgan vaqt'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Xato haqida ma\'lumot'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
