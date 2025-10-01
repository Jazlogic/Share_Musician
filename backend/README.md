# Backend de Share Musician

Este documento detalla la configuración, las tecnologías y la estructura del backend para la aplicación **Share Musician**. El objetivo principal de este backend es proporcionar una API robusta y escalable para gestionar usuarios, publicaciones, interacciones y otros datos relacionados con la plataforma de intercambio musical.



## Tecnologías Utilizadas

Las siguientes tecnologías y librerías son fundamentales para el desarrollo y funcionamiento de este backend:

- **Express.js**: Framework web minimalista y flexible para Node.js (`^5.1.0`). Elegido por su simplicidad, rendimiento y la gran comunidad que lo soporta, ideal para construir APIs RESTful.
- **TypeScript**: Un superconjunto tipado de JavaScript que compila a JavaScript plano (`^5.9.3`). Su uso mejora la calidad del código, facilita el mantenimiento y la detección temprana de errores, especialmente en proyectos grandes.
- **Nodemon**: Una utilidad que monitorea los cambios en los archivos fuente y reinicia automáticamente el servidor (`^3.1.10`). Esencial para un flujo de trabajo de desarrollo eficiente, ya que evita la necesidad de reiniciar manualmente el servidor tras cada cambio.
- **Dotenv**: Módulo para cargar variables de entorno desde un archivo `.env` a `process.env` (`^17.2.3`). Permite gestionar configuraciones sensibles o específicas del entorno de forma segura y desacoplada del código fuente.
- **CORS**: Middleware de Express para habilitar Cross-Origin Resource Sharing (`^2.8.5`). Necesario para permitir que aplicaciones frontend (que se ejecutan en un dominio diferente) puedan realizar solicitudes al backend.
- **Swagger/OpenAPI**: Un conjunto de herramientas para diseñar, construir, documentar y consumir APIs RESTful. Proporciona una documentación interactiva y estandarizada de la API.
  - `swagger-ui-express`: Middleware de Express para servir la interfaz de usuario de Swagger (`^5.0.1`). Facilita la visualización y prueba de la API directamente desde el navegador.
  - `swagger-jsdoc`: Una herramienta que genera especificaciones OpenAPI (Swagger) a partir de comentarios JSDoc en el código fuente (`^6.2.8`). Permite mantener la documentación de la API sincronizada con el código de forma sencilla.

Además, se utilizan las definiciones de tipo (`@types`) para TypeScript para todas las librerías principales, lo que garantiza una mejor experiencia de desarrollo con autocompletado y verificación de tipos.

## Configuración del Proyecto

Para poner en marcha el backend de Share Musician, sigue los siguientes pasos:

### Instalación de Dependencias

Antes de ejecutar el proyecto, es necesario instalar todas las dependencias listadas en el archivo `package.json`. Navega al directorio `backend` en tu terminal y ejecuta el siguiente comando:

```bash
npm install
```

Este comando descargará e instalará todas las librerías necesarias, incluyendo las dependencias de producción y desarrollo.

### Variables de Entorno

El proyecto utiliza variables de entorno para gestionar configuraciones que pueden variar entre diferentes entornos (desarrollo, producción, etc.) o que contienen información sensible. Estas variables se cargan desde un archivo `.env` ubicado en el directorio raíz del backend (`backend/.env`).

**Creación del archivo `.env`:**

Si no existe, crea un archivo llamado `.env` en el directorio `backend`.

**Contenido del archivo `.env`:**

El archivo `.env` debe contener las siguientes variables:

```dotenv
PORT=3001
APP_NAME="Share Musician API"
```

- `PORT`: Define el puerto en el que el servidor Express escuchará las solicitudes entrantes. Por defecto, se utiliza el puerto `3001`.
- `APP_NAME`: Establece el nombre de la aplicación, que se utiliza para el título de la documentación de Swagger. Por defecto, es "Share Musician API".

**Importante:** El archivo `.env` no debe ser versionado en sistemas de control de versiones como Git, ya que puede contener información sensible. Asegúrate de que `.env` esté incluido en el archivo `.gitignore`.

### Ejecución del Servidor de Desarrollo

Para iniciar el servidor backend en modo de desarrollo, lo que permite la recarga automática de los cambios gracias a `nodemon`, ejecuta el siguiente comando desde el directorio `backend`:

```bash
npm run dev
```

Una vez iniciado, el servidor estará escuchando en la dirección `http://localhost:3001` (o el puerto que hayas configurado en tu archivo `.env`). Este modo es ideal para el desarrollo activo, ya que cualquier modificación en el código fuente (`.ts`) provocará un reinicio automático del servidor, aplicando los cambios al instante.

## Documentación de la API (Swagger)

La API de Share Musician está completamente documentada utilizando Swagger/OpenAPI, lo que proporciona una interfaz interactiva para explorar y probar los endpoints disponibles.

### Acceso a la Documentación

Una vez que el servidor de desarrollo esté en ejecución, puedes acceder a la interfaz de usuario de Swagger a través de tu navegador web en la siguiente URL:

`http://localhost:3001/api-docs`

En esta interfaz, podrás:

- **Visualizar todos los endpoints**: Ver una lista completa de las rutas de la API, los métodos HTTP que aceptan (GET, POST, PUT, DELETE, etc.) y sus descripciones.
- **Entender los parámetros**: Conocer los parámetros de entrada requeridos o opcionales para cada endpoint, incluyendo su tipo de dato y formato.
- **Probar los endpoints**: Realizar solicitudes directamente desde la interfaz de Swagger y ver las respuestas del servidor en tiempo real.
- **Conocer los modelos de respuesta**: Entender la estructura de los datos que la API devuelve para cada solicitud exitosa o en caso de error.

La documentación se genera automáticamente a partir de los comentarios JSDoc en el código fuente, asegurando que esté siempre actualizada con la implementación de la API.

## Resumen de Commits Recientes

A continuación, se presenta un resumen de los commits más relevantes que reflejan el progreso y las características implementadas en el backend:

- **feat: Configuración inicial del backend con Express y TypeScript**: Este commit establece la base del proyecto backend, incluyendo la configuración de un servidor Express, la integración de TypeScript para un desarrollo más robusto, Nodemon para la recarga automática en desarrollo y CORS para manejar las políticas de seguridad de origen cruzado. También se incluye la configuración inicial del archivo `.env`.
- **feat: Configuración de Swagger y gestión de APP_NAME**: En este commit, se integró Swagger/OpenAPI para proporcionar una documentación interactiva de la API. Se configuró `swagger-ui-express` y `swagger-jsdoc` para generar la documentación a partir del código. Además, se implementó la gestión del nombre de la aplicación (`APP_NAME`) a través de una variable de entorno en `.env`, que se utiliza para personalizar el título de la documentación de Swagger.
- **docs: Añadir README.md para la documentación del backend**: Este commit introduce el archivo `README.md` en el directorio `backend`, proporcionando una documentación inicial sobre la configuración del proyecto, las tecnologías utilizadas y cómo ejecutar el servidor.
- **docs: Actualizar README.md con estructura de proyecto y versiones de dependencias**: Este commit mejora la documentación del `README.md` añadiendo una descripción detallada de la estructura del proyecto y especificando las versiones exactas de las dependencias utilizadas, lo que facilita la comprensión y replicación del entorno de desarrollo.