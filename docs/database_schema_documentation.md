# Documentación del Esquema de la Base de Datos

Este documento detalla el esquema de la base de datos del proyecto "Share Musician", incluyendo las tablas, relaciones, tipos de datos y las modificaciones realizadas para asegurar la consistencia y optimización.

## 1. Visión General del Esquema

El esquema de la base de datos está diseñado para gestionar usuarios, solicitudes de músicos, ofertas, historial de solicitudes y métricas asociadas. Se ha puesto especial énfasis en la consistencia de los nombres, la integridad referencial y la optimización del rendimiento.

## 2. Archivos SQL Revisados

Los siguientes archivos SQL han sido revisados y/o modificados:

*   `users.sql`
*   `password.sql`
*   `user_profile_image_history.sql`
*   `solicitudes.sql`
*   `complete_sql.sql` (analizado para identificar inconsistencias)

## 3. Detalles del Esquema por Archivo

### 3.1. `users.sql`

Este archivo define la estructura principal para la gestión de usuarios y entidades relacionadas.

**Tablas:**

*   **`churches`**:
    *   `churches_id` (UUID PRIMARY KEY): Identificador único de la iglesia.
    *   `name` (VARCHAR(255) UNIQUE NOT NULL): Nombre de la iglesia.
    *   `location` (VARCHAR(255)): Ubicación de la iglesia.
    *   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de creación.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de última actualización.
*   **`users`**:
    *   `user_id` (UUID PRIMARY KEY DEFAULT uuid_generate_v4()): Identificador único del usuario. **(Nota: Esta es la clave primaria consistente en todo el esquema).**
    *   `name` (VARCHAR(255) NOT NULL): Nombre del usuario.
    *   `email` (VARCHAR(255) UNIQUE NOT NULL): Correo electrónico del usuario.
    *   `phone` (VARCHAR(20) NOT NULL): Número de teléfono.
    *   `role` (VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'musician', 'admin'))): Rol principal del usuario.
    *   `active_role` (VARCHAR(20) DEFAULT 'musician' CHECK (active_role IN ('leader', 'musician'))): Rol activo del usuario.
    *   `status` (VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected'))): Estado de la cuenta del usuario.
    *   `church_id` (UUID REFERENCES churches(churches_id) ON DELETE SET NULL): Clave foránea a la tabla `churches`.
    *   `profileKey` (VARCHAR(255)): Clave para la imagen de perfil.
    *   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de creación.
    *   `updated_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de última actualización.
*   **`posts`**:
    *   `id` (UUID PRIMARY KEY DEFAULT uuid_generate_v4()): Identificador único del post.
    *   `userId` (UUID REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al usuario que creó el post. **(Nota: Se ha identificado una inconsistencia en la nomenclatura (`userId` en lugar de `user_id`). Se recomienda cambiar a `user_id` para mantener la consistencia `snake_case`).**
    *   `content` (TEXT NOT NULL): Contenido del post.
    *   `imageKey` (VARCHAR(255)): Clave para la imagen del post.
    *   `createdAt` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de creación.

### 3.2. `password.sql`

Este archivo gestiona las contraseñas de los usuarios de forma separada para mayor seguridad.

**Tablas:**

*   **`user_passwords`**:
    *   `password_id` (UUID PRIMARY KEY DEFAULT uuid_generate_v4()): Identificador único de la contraseña.
    *   `user_id` (UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al usuario. **(Corregido: Anteriormente referenciaba a `users(id)`, ahora a `users(user_id)` para consistencia).**
    *   `password` (VARCHAR(255) NOT NULL): Contraseña hasheada.
    *   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW()): Fecha de creación.

**Índices:**

*   `idx_user_passwords_user_id` (ON user_passwords(user_id)): Para mejorar el rendimiento de las búsquedas por usuario.

**Seguridad:**

*   Row Level Security (RLS) habilitado.
*   Política: "Users can read own password" para permitir a los usuarios leer sus propias contraseñas.

### 3.3. `user_profile_image_history.sql`

Este archivo registra el historial de cambios de imágenes de perfil de los usuarios.

**Tablas:**

*   **`user_profile_image_history`**:
    *   `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid()): Identificador único del registro de historial.
    *   `user_id` (UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al usuario.
    *   `profilekey` (TEXT NOT NULL): Clave de la imagen de perfil.
    *   `uploaded_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP): Fecha de subida.

### 3.4. `solicitudes.sql`

Este archivo contiene la lógica principal para las solicitudes de músicos, ofertas, historial y métricas.

**ENUMs:**

*   **`request_status`**: Define los posibles estados de una solicitud (e.g., 'CREATED', 'WAITING_OFFERS', 'COMPLETED').
*   **`offer_status`**: Define los posibles estados de una oferta (e.g., 'SENT', 'ACCEPTED', 'REJECTED').
*   **`user_type`**: Define los tipos de usuario ('leader', 'musician', 'admin'). **(Corregido: Valores en minúsculas para coincidir con `users.sql`).**

**Tablas:**

*   **`request`**:
    *   `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid()): Identificador único de la solicitud.
    *   `client_id` (UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al cliente (usuario con rol 'leader'). **(Corregido: Anteriormente referenciaba a `client(id)`).**
    *   `musician_id` (UUID REFERENCES users(user_id) ON DELETE SET NULL): Clave foránea al músico. **(Corregido: Anteriormente referenciaba a `musician(id)`).**
    *   `title` (VARCHAR(255) NOT NULL): Título de la solicitud.
    *   `description` (TEXT NOT NULL): Descripción detallada.
    *   `category` (VARCHAR(100)): Categoría de la solicitud.
    *   `location` (JSONB): Información de ubicación (flexible).
    *   `event_date` (TIMESTAMP): Fecha del evento.
    *   `start_time` (TIME): Hora de inicio del evento. **(Mejorado: Anteriormente `VARCHAR(20)`).**
    *   `end_time` (TIME): Hora de finalización del evento. **(Mejorado: Anteriormente `VARCHAR(20)`).**
    *   `event_duration` (INTERVAL): Duración del evento. **(Mejorado: Anteriormente `VARCHAR(20)`).**
    *   `price` (NUMERIC(12,2)): Precio acordado.
    *   `tip` (NUMERIC(12,2)): Propina.
    *   `status` (request_status NOT NULL DEFAULT 'CREATED'): Estado actual de la solicitud.
    *   `created_at` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha de creación.
    *   `updated_at` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha de última actualización.
    *   `updated_by` (UUID): Usuario que realizó la última actualización.
    *   `expiration_date` (TIMESTAMP): Fecha de expiración de la solicitud.
    *   `cancellation_reason` (TEXT): Razón de cancelación.
    *   `client_rating` (INT CHECK (client_rating BETWEEN 1 AND 5)): Calificación del cliente.
    *   `musician_rating` (INT CHECK (musician_rating BETWEEN 1 AND 5)): Calificación del músico.
    *   `client_comment` (TEXT): Comentario del cliente.
    *   `musician_comment` (TEXT): Comentario del músico.
    *   `is_public` (BOOLEAN DEFAULT TRUE): Indica si la solicitud es pública.
    *   `reopened_from_id` (UUID REFERENCES request(id) ON DELETE SET NULL): Referencia a una solicitud reabierta.
*   **`offer`**:
    *   `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid()): Identificador único de la oferta.
    *   `request_id` (UUID NOT NULL REFERENCES request(id) ON DELETE CASCADE): Clave foránea a la solicitud.
    *   `musician_id` (UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al músico que hizo la oferta. **(Corregido: Anteriormente referenciaba a `musician(id)`).**
    *   `message` (TEXT): Mensaje de la oferta.
    *   `price` (NUMERIC(12,2)): Precio de la oferta.
    *   `status` (offer_status NOT NULL DEFAULT 'SENT'): Estado de la oferta.
    *   `created_at` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha de creación.
    *   `updated_by` (UUID): Usuario que realizó la última actualización.
*   **`request_history`**:
    *   `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid()): Identificador único del registro de historial.
    *   `request_id` (UUID NOT NULL REFERENCES request(id) ON DELETE CASCADE): Clave foránea a la solicitud.
    *   `old_status` (request_status): Estado anterior de la solicitud.
    *   `new_status` (request_status NOT NULL): Nuevo estado de la solicitud.
    *   `user_id` (UUID): Usuario que inició el cambio de estado.
    *   `updated_by` (UUID): Usuario que realizó la actualización. **(Consideración: Posible redundancia con `user_id`. Se recomienda clarificar el propósito de ambos campos).**
    *   `user_type` (user_type): Tipo de usuario que realizó el cambio.
    *   `change_date` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha del cambio.
*   **`musician_metrics`**:
    *   `musician_id` (UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al músico. **(Corregido: Anteriormente referenciaba a `musician(id)`).**
    *   `total_canceled_by_musician` (INT DEFAULT 0): Total de solicitudes canceladas por el músico.
    *   `total_completed` (INT DEFAULT 0): Total de solicitudes completadas.
    *   `total_rejected` (INT DEFAULT 0): Total de solicitudes rechazadas.
    *   `total_in_dispute` (INT DEFAULT 0): Total de solicitudes en disputa.
    *   `total_archived` (INT DEFAULT 0): Total de solicitudes archivadas.
    *   `updated_by` (UUID): Usuario que realizó la última actualización.
    *   `updated_at` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha de última actualización.
*   **`client_metrics`**:
    *   `client_id` (UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE): Clave foránea al cliente. **(Corregido: Anteriormente referenciaba a `client(id)`).**
    *   `total_canceled_by_client` (INT DEFAULT 0): Total de solicitudes canceladas por el cliente.
    *   `total_completed` (INT DEFAULT 0): Total de solicitudes completadas.
    *   `total_rejected` (INT DEFAULT 0): Total de solicitudes rechazadas.
    *   `total_expired` (INT DEFAULT 0): Total de solicitudes expiradas.
    *   `total_in_dispute` (INT DEFAULT 0): Total de solicitudes en disputa.
    *   `total_archived` (INT DEFAULT 0): Total de solicitudes archivadas.
    *   `updated_by` (UUID): Usuario que realizó la última actualización.
    *   `updated_at` (TIMESTAMP NOT NULL DEFAULT NOW()): Fecha de última actualización.

**Índices:**

Se han añadido índices para optimizar las consultas en las tablas `request`, `offer` y `request_history` en las columnas más utilizadas para búsquedas y uniones.

**Trigger:**

*   `update_request_timestamp()`: Función que actualiza automáticamente la columna `updated_at` en la tabla `request` antes de cada actualización de fila.

### 3.5. `complete_sql.sql`

Este archivo fue analizado y se identificó una inconsistencia crítica:

*   Define la tabla `users` con `id UUID PRIMARY KEY`, lo cual entra en conflicto con `users.sql` que usa `user_id UUID PRIMARY KEY`.
*   Hace referencia a `users(id)` en sus propias definiciones de tablas `user_passwords` y `user_instruments`.

**Acción Requerida:** Se necesita clarificar si `complete_sql.sql` es la fuente de verdad o si debe ser actualizado/eliminado para reflejar el esquema unificado.

## 4. Inconsistencias y Resoluciones

*   **Inconsistencia 1: Clave Primaria de `users` (`id` vs `user_id`)**
    *   **Problema:** `complete_sql.sql` usaba `id` y `users.sql` usaba `user_id`. Esto causaba errores de referencia.
    *   **Resolución:** Se decidió estandarizar a `user_id` como la clave primaria de la tabla `users` en `users.sql`. Las referencias en `password.sql`, `user_profile_image_history.sql` y `solicitudes.sql` fueron actualizadas para apuntar a `users(user_id)`. La inconsistencia en `complete_sql.sql` persiste y requiere clarificación.
*   **Inconsistencia 2: Referencias a `client(id)` y `musician(id)`**
    *   **Problema:** `solicitudes.sql` referenciaba a tablas `client` y `musician` que no existían como entidades separadas, sino como roles dentro de la tabla `users`.
    *   **Resolución:** Todas las referencias a `client(id)` y `musician(id)` en `solicitudes.sql` fueron cambiadas para referenciar a `users(user_id)`.
*   **Inconsistencia 3: Capitalización de `user_type`**
    *   **Problema:** El `ENUM user_type` en `solicitudes.sql` estaba en mayúsculas, mientras que los roles en `users.sql` estaban en minúsculas, causando un conflicto de sensibilidad a mayúsculas y minúsculas.
    *   **Resolución:** Los valores del `ENUM user_type` en `solicitudes.sql` fueron cambiados a minúsculas (`'leader'`, `'musician'`, `'admin'`) para coincidir con `users.sql`.
*   **Mejora: Tipos de Datos para Tiempo/Duración**
    *   **Problema:** `start_time`, `end_time` y `event_duration` en `request` usaban `VARCHAR(20)`.
    *   **Resolución:** Se cambiaron a `TIME` para `start_time` y `end_time`, y a `INTERVAL` para `event_duration` para un manejo más preciso y eficiente.

## 5. Consideraciones Pendientes

*   **Propósito de `complete_sql.sql`:** Es crucial definir si este archivo es el esquema maestro o si debe ser actualizado/eliminado. Si es el maestro, entonces `users.sql` y otros archivos deben alinearse con él. Si no, `complete_sql.sql` debe ser corregido o ignorado.
*   **Redundancia en `request_history` (`user_id` vs `updated_by`):** Se recomienda clarificar el propósito exacto de estos dos campos en la tabla `request_history`. Si ambos cumplen la misma función, uno podría ser eliminado.
*   **Nomenclatura en `posts.userId`:** Se sugiere cambiar `userId` a `user_id` en la tabla `posts` de `users.sql` para mantener la consistencia `snake_case` en todo el esquema.

Este documento será actualizado a medida que se realicen más cambios o se resuelvan las consideraciones pendientes.