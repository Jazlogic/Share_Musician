# Share Musician

## Descripción del Proyecto

**Share Musician** es una plataforma diseñada para conectar líderes de iglesias con músicos talentosos para eventos y servicios musicales. Facilita la gestión de solicitudes de eventos, ofertas de músicos, disponibilidad, pagos y notificaciones, creando una comunidad vibrante y organizada para el música cristiana.

## Tecnologías Utilizadas

Este proyecto está construido con un enfoque moderno y escalable, utilizando las siguientes tecnologías:

### Backend

*   **Framework**: Express.js
*   **Lenguaje**: TypeScript
*   **Base de Datos**: PostgreSQL (gestionada a través de Supabase)

### Frontend

*   **Framework**: React Native (con Expo)
*   **Lenguaje**: TypeScript

### Base de Datos

*   **Sistema de Gestión de Base de Datos (SGBD)**: PostgreSQL
*   **Plataforma**: Supabase (para autenticación, base de datos y RLS)

## Características Principales

*   **Gestión de Usuarios**: Roles diferenciados para líderes, músicos y administradores.
*   **Autenticación Segura**: Manejo de contraseñas de usuario.
*   **Solicitudes de Eventos**: Los líderes pueden crear y gestionar solicitudes de servicios musicales.
*   **Ofertas de Músicos**: Los músicos pueden ver las solicitudes disponibles y enviar ofertas.
*   **Gestión de Disponibilidad**: Los músicos pueden gestionar su disponibilidad, incluyendo bloqueos por eventos y tiempos de viaje.
*   **Cálculo de Precios**: Sistema dinámico para calcular el costo de los eventos basado en tarifas por hora, comisiones y tarifas de servicio.
*   **Notificaciones**: Sistema de notificaciones para mantener informados a los usuarios sobre el estado de las solicitudes y ofertas.
*   **Seguridad a Nivel de Fila (RLS)**: Políticas de seguridad implementadas para garantizar que los usuarios solo accedan a sus propios datos.
*   **Gestión de Balances y Transacciones**: Seguimiento de ganancias, retiros y transacciones de los usuarios.

## Estructura del Proyecto

```
share_musician/
├── .gitignore
├── backend/                  # Lógica del servidor (Express.js, TypeScript)
│   ├── .gitignore
│   └── index.ts
├── database/                 # Esquemas y migraciones de la base de datos (SQL)
│   ├── complete_sql.sql
│   ├── password.sql
│   └── users.sql
├── docs/                     # Documentación del proyecto
│   ├── README.md
│   └── instalacion/
│       └── credenciales.md
└── frontend/                 # Aplicación móvil (React Native Expo, TypeScript)
    └── .gitignore
```

## Configuración del Entorno

Para configurar el proyecto localmente, sigue estos pasos:

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd share_musician
```

### 2. Configuración del Backend

Navega al directorio `backend` e instala las dependencias:

```bash
cd backend
npm install
# O yarn install
```

Crea un archivo `.env` basado en `.env.example` (si existe) y configura las variables de entorno necesarias, como las credenciales de la base de datos.

### 3. Configuración del Frontend

Navega al directorio `frontend` e instala las dependencias:

```bash
cd frontend
npm install
# O yarn install
```

Configura tu entorno Expo y las variables de entorno necesarias.

### 4. Configuración de la Base de Datos

Este proyecto utiliza PostgreSQL con Supabase. Asegúrate de tener una instancia de Supabase configurada y aplica los esquemas SQL proporcionados en el directorio `database/`.

## Uso

### Iniciar el Backend

```bash
cd backend
npm start
# O yarn start
```

### Iniciar el Frontend

```bash
cd frontend
npm start
# O expo start
```

## Contribución

¡Las contribuciones son bienvenidas! Por favor, lee `CONTRIBUTING.md` (próximamente) para conocer el proceso.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` (próximamente) para más detalles.