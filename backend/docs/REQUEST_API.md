# API de Solicitudes - Documentación Completa

## 📋 Endpoints Disponibles

### 1. **Crear Solicitud**
```http
POST /request
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Concierto Benéfico",
  "description": "Necesitamos música para evento benéfico",
  "category": "Concierto",
  "instrument": "Guitarra Acústica",
  "event_date": "2025-10-25",
  "start_time": "19:00:00",
  "end_time": "22:00:00",
  "location": {
    "address": "Parque Central, Santo Domingo",
    "latitude": 18.48605,
    "longitude": -69.93121
  },
  "is_public": true
}
```

**Respuesta:**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "title": "Concierto Benéfico",
  "description": "Necesitamos música para evento benéfico",
  "event_type_id": "uuid",
  "event_date": "2025-10-25",
  "start_time": "19:00:00",
  "end_time": "22:00:00",
  "location": {...},
  "total_price": 450.00,
  "status": "CREATED",
  "is_public": true,
  "created_at": "2025-10-16T10:00:00Z"
}
```

### 2. **Obtener Solicitudes Creadas**
```http
GET /request/created
Authorization: Bearer <token>
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "title": "Concierto Benéfico",
    "description": "...",
    "category": "Concierto",
    "location": {...},
    "event_date": "2025-10-25",
    "start_time": "19:00:00",
    "end_time": "22:00:00",
    "total_price": 450.00,
    "status": "CREATED",
    "is_public": true,
    "created_at": "2025-10-16T10:00:00Z"
  }
]
```

### 3. **Obtener Tipos de Eventos**
```http
GET /request/event-types
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Concierto",
    "price_factor": 1.20
  },
  {
    "id": "uuid", 
    "name": "Boda",
    "price_factor": 1.50
  }
]
```

### 4. **Obtener Instrumentos**
```http
GET /request/instruments
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Guitarra Acústica",
    "category": "cuerda",
    "price_factor": 1.0
  },
  {
    "id": "uuid",
    "name": "Piano",
    "category": "teclado", 
    "price_factor": 1.2
  }
]
```

### 5. **Obtener Solicitud por ID**
```http
GET /request/{id}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "musician_id": null,
  "title": "Concierto Benéfico",
  "description": "...",
  "category": "Concierto",
  "location": {...},
  "total_price": 450.00,
  "distance_km": 10.5,
  "event_date": "2025-10-25",
  "start_time": "19:00:00",
  "end_time": "22:00:00",
  "status": "CREATED",
  "is_public": true,
  "instruments": ["Guitarra Acústica", "Piano"]
}
```

## 🔐 Autenticación y Autorización

### Roles Permitidos
- **client**: Puede crear y gestionar sus propias solicitudes
- **musician**: Puede crear solicitudes y ver todas las solicitudes públicas
- **admin**: Acceso completo al sistema

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## ✅ Validaciones Implementadas

### Campos Requeridos
- `title`: Título de la solicitud
- `description`: Descripción detallada
- `category`: Tipo de evento (debe existir en event_types)
- `instrument`: Instrumento requerido (debe existir en instruments)
- `event_date`: Fecha del evento
- `start_time`: Hora de inicio
- `end_time`: Hora de finalización
- `location`: Ubicación del evento (objeto JSON)

### Validaciones de Datos
- ✅ Fecha no puede ser en el pasado
- ✅ Hora de fin debe ser posterior a hora de inicio
- ✅ Categoría e instrumento deben existir en la base de datos
- ✅ Cálculo automático de precio basado en duración y factores
- ✅ Notificaciones automáticas a músicos disponibles

## 🧮 Cálculo de Precios

El sistema calcula automáticamente el precio basado en:

```javascript
precio_total = tarifa_base * duración_horas * factor_instrumento * factor_evento + comisión_sistema

// Ejemplo:
// tarifa_base: 500 DOP/hora
// duración: 3 horas  
// factor_instrumento: 1.0 (Guitarra Acústica)
// factor_evento: 1.2 (Concierto)
// comisión_sistema: 10%
// precio_total = 500 * 3 * 1.0 * 1.2 + (500 * 3 * 1.0 * 1.2 * 0.1) = 1800 + 180 = 1980 DOP
```

## 🔔 Sistema de Notificaciones

### Notificaciones Automáticas
1. **Nueva Solicitud**: Se notifica a todos los músicos activos cuando se crea una solicitud pública
2. **Nueva Oferta**: Se notifica al cliente cuando un músico hace una oferta
3. **Cambio de Estado**: Se notifican cambios importantes en el estado de la solicitud

### Tipos de Notificaciones
- `SYSTEM`: Notificaciones del sistema
- `MESSAGE`: Mensajes entre usuarios
- `ALERT`: Alertas importantes

## 🗄️ Base de Datos

### Tablas Principales
- `request`: Solicitudes de música
- `event_types`: Tipos de eventos disponibles
- `instruments`: Instrumentos disponibles
- `request_instruments`: Relación solicitud-instrumentos
- `offer`: Ofertas de músicos
- `notifications`: Sistema de notificaciones
- `pricing_config`: Configuración de precios

### Estados de Solicitud
- `CREATED`: Recién creada, esperando ofertas
- `OFFER_RECEIVED`: Se recibió al menos una oferta
- `OFFER_ACCEPTED`: Se aceptó una oferta
- `CONFIRMED`: Confirmada y lista para ejecutar
- `IN_PROGRESS`: En curso
- `COMPLETED`: Completada
- `CANCELLED_BY_CLIENT`: Cancelada por el cliente
- `CANCELLED_BY_MUSICIAN`: Cancelada por el músico
- `EXPIRED`: Expirada
- `ARCHIVED`: Archivada

## 🚨 Códigos de Error

### 400 Bad Request
```json
{
  "message": "Missing required fields: title, description, category, instrument, event_date, start_time, end_time, location"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized: User information not found"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: Only clients and musicians can create requests"
}
```

### 404 Not Found
```json
{
  "message": "Request not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error creating request"
}
```

## 📝 Ejemplos de Uso

### Frontend - Crear Solicitud
```javascript
const createRequest = async (requestData) => {
  const response = await fetch('/api/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  if (response.ok) {
    const newRequest = await response.json();
    console.log('Solicitud creada:', newRequest);
    return newRequest;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
};
```

### Frontend - Obtener Instrumentos
```javascript
const getInstruments = async () => {
  const response = await fetch('/api/request/instruments');
  const instruments = await response.json();
  return instruments;
};
```

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://user:password@localhost:5432/share_musician
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Dependencias Principales
```json
{
  "express": "^4.18.0",
  "pg": "^8.8.0", 
  "moment": "^2.29.0",
  "dotenv": "^16.0.0"
}
```
