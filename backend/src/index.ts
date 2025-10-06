import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

import authRoutes from './routes/auth';
import churchRoutes from './routes/church';
import userRoutes from './routes/user'; // Import the new user routes
import storageRoutes from './routes/storage';
import postRoutes from './routes/post'; // Import the new post routes
import requestRoutes from './routes/request';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Use cors middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Share Musician API',
      version: '1.0.0',
      description: 'API documentation for the Share Musician application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'name', 'phone'],
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password',
            },
            name: {
              type: 'string',
              description: 'User\'s full name',
            },
            phone: {
              type: 'string',
              description: 'User\'s phone number',
            },
            role: {
              type: 'string',
              enum: ['leader', 'musician', 'admin'],
              default: 'musician',
              description: 'User\'s role',
            },
            active_role: {
              type: 'string',
              enum: ['leader', 'musician'],
              default: 'musician',
              description: 'User\'s active role',
            },
            status: {
              type: 'string',
              enum: ['active', 'pending', 'rejected'],
              default: 'active',
              description: 'User\'s account status',
            },
            church_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID of the church the user belongs to',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
          },
        },
        Church: { // Add Church schema
          type: 'object',
          required: ['name'],
          properties: {
            churches_id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
            },
            name: {
              type: 'string',
              description: 'The name of the church',
            },
            location: {
              type: 'string',
              description: 'The location of the church',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/routes/storage.ts', './src/routes/post.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/churches', churchRoutes);
app.use('/users', userRoutes);
app.use('/storage', storageRoutes);
app.use('/posts', postRoutes); // Use the new post routes
app.use('/requests', requestRoutes);

app.get('/', (req, res) => {
  res.send('Share Musician API is running');
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});