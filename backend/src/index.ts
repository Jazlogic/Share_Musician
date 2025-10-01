import express ,{Request,Response}from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3001;

// Opciones de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: process.env.APP_NAME || 'API de Share Musician',
      version: '1.0.0',
      description: 'Documentación de la API para la aplicación Share Musician',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/**/*.ts'], // Rutas a los archivos de la API
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req:Request, res:Response) => {
  res.send(`¡Hola desde el backend de ${process.env.APP_NAME}!`);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Mantener el proceso activo en entornos donde se cierra prematuramente
process.stdin.resume();