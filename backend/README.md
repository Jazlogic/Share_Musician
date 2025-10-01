# Backend de Share Musician

Este documento describe la configuración inicial y las tecnologías utilizadas en el backend de la aplicación Share Musician.

## Estructura del Proyecto

```
share_musician/
├── .gitignore
├── README.md
├── backend/
│   ├── .gitignore
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   └── index.ts
│   └── tsconfig.json
├── database/
│   ├── complete_sql.sql
│   ├── password.sql
│   └── users.sql
├── docs/
│   ├── README.md
│   └── instalacion/
└── frontend/
    └── .gitignore
```

## Tecnologías Utilizadas

- **Express.js**: Framework web para Node.js (`^5.1.0`).
- **TypeScript**: Lenguaje de programación que añade tipado estático a JavaScript (`^5.9.3`).
- **Nodemon**: Herramienta para reiniciar automáticamente el servidor durante el desarrollo (`^3.1.10`).
- **Dotenv**: Para cargar variables de entorno desde un archivo `.env` (`^17.2.3`).
- **CORS**: Middleware para habilitar Cross-Origin Resource Sharing (`^2.8.5`).
- **Swagger/OpenAPI**: Para la documentación interactiva de la API.
  - `swagger-ui-express`: Middleware para servir la interfaz de usuario de Swagger (`^5.0.1`).
  - `swagger-jsdoc`: Para generar la especificación OpenAPI a partir de comentarios JSDoc (`^6.2.8`).

## Configuración del Proyecto

### Instalación de Dependencias

Para instalar todas las dependencias necesarias, navega al directorio `backend` y ejecuta:

```bash
npm install
```

### Variables de Entorno

El proyecto utiliza un archivo `.env` para gestionar las variables de entorno. Asegúrate de tener un archivo `.env` en el directorio `backend` con las siguientes variables:

```
PORT=3001
APP_NAME="Share Musician API"
```

- `PORT`: El puerto en el que el servidor Express escuchará las peticiones.
- `APP_NAME`: El nombre de la aplicación, utilizado en la documentación de Swagger.

### Ejecución del Servidor de Desarrollo

Para iniciar el servidor en modo de desarrollo (con `nodemon` para recarga automática), ejecuta:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001` (o el puerto configurado en `.env`).

## Documentación de la API (Swagger)

La documentación interactiva de la API, generada con Swagger, está disponible en:

`http://localhost:3001/api-docs`

Aquí podrás ver todos los endpoints definidos, sus parámetros y modelos de respuesta.

## Resumen de Commits Recientes

- **feat: Configuración inicial del backend con Express y TypeScript**: Configuración básica del servidor, incluyendo Express, TypeScript, Nodemon y CORS.
- **feat: Configuración de Swagger y gestión de APP_NAME**: Integración de Swagger para la documentación de la API y uso de la variable de entorno `APP_NAME` para el título de la aplicación.