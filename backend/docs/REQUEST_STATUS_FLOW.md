# 🔄 FLUJO DE ESTADOS DE LAS SOLICITUDES

## 📋 ESTADOS DISPONIBLES

### 🎯 **Estados Principales del Sistema:**

```sql
CREATE TYPE request_status AS ENUM (
  'CREATED',              -- La solicitud ha sido creada por el cliente/líder
  'OFFER_RECEIVED',       -- Se ha recibido al menos una oferta de un músico
  'OFFER_ACCEPTED',       -- Una oferta ha sido aceptada por el cliente/líder
  'CONFIRMED',            -- La solicitud ha sido confirmada y está lista para ejecutarse
  'IN_PROGRESS',          -- El evento está en curso
  'COMPLETED',            -- El servicio musical ha sido completado
  'CANCELLED_BY_CLIENT',  -- La solicitud ha sido cancelada por el cliente
  'CANCELLED_BY_MUSICIAN',-- La solicitud ha sido cancelada por el músico
  'REOPENED',             -- La solicitud ha sido reabierta después de una cancelación
  'EXPIRED',              -- La solicitud ha expirado sin ser completada
  'ARCHIVED'              -- La solicitud ha sido archivada
);
```

## 🔄 FLUJO COMPLETO DE ESTADOS

### **1. 🚀 CREACIÓN (CREATED)**
- **¿Cuándo?** Cliente/líder crea una nueva solicitud
- **Acciones automáticas:**
  - ✅ Cálculo automático del precio (`trg_calculate_request_price`)
  - ✅ Notificación a músicos disponibles (`trg_notify_musicians_new_request`)
  - ✅ Creación de registro en `request` con estado `CREATED`

### **2. 📨 OFERTAS RECIBIDAS (OFFER_RECEIVED)**
- **¿Cuándo?** Un músico envía su primera oferta
- **Transición:** `CREATED` → `OFFER_RECEIVED`
- **Acciones automáticas:**
  - ✅ Notificación al líder (`trg_notify_leader_new_offer`)
  - ✅ Actualización del estado de la solicitud

### **3. ✅ OFERTA ACEPTADA (OFFER_ACCEPTED)**
- **¿Cuándo?** El cliente/líder acepta una oferta específica
- **Transición:** `OFFER_RECEIVED` → `OFFER_ACCEPTED`
- **Acciones automáticas:**
  - ✅ Notificación al músico seleccionado (`trg_notify_musician_offer_selected`)
  - ✅ Actualización del estado de la oferta a `ACCEPTED`
  - ✅ Asignación del `musician_id` a la solicitud

### **4. 🔒 CONFIRMADO (CONFIRMED)**
- **¿Cuándo?** Ambos participantes confirman la realización del evento
- **Transición:** `OFFER_ACCEPTED` → `CONFIRMED`
- **Acciones manuales:**
  - 📝 Confirmación del cliente/líder
  - 📝 Confirmación del músico
  - 💰 Procesamiento de pagos (si aplica)

### **5. 🎵 EN PROGRESO (IN_PROGRESS)**
- **¿Cuándo?** El evento musical ha comenzado
- **Transición:** `CONFIRMED` → `IN_PROGRESS`
- **Acciones automáticas:**
  - ✅ Notificación a ambos participantes (`trg_notify_event_status_change`)
  - ✅ Recordatorio automático 10 min antes (`send_event_reminder`)

### **6. ✅ COMPLETADO (COMPLETED)**
- **¿Cuándo?** El evento musical ha terminado exitosamente
- **Transición:** `IN_PROGRESS` → `COMPLETED`
- **Acciones automáticas:**
  - 💰 Procesamiento de pagos finales
  - 📊 Actualización de estadísticas
  - ⭐ Sistema de calificaciones (futuro)

## 🚫 ESTADOS DE CANCELACIÓN

### **7. ❌ CANCELADO POR CLIENTE (CANCELLED_BY_CLIENT)**
- **¿Cuándo?** El cliente/líder cancela la solicitud
- **Transiciones posibles:**
  - `CREATED` → `CANCELLED_BY_CLIENT`
  - `OFFER_RECEIVED` → `CANCELLED_BY_CLIENT`
  - `OFFER_ACCEPTED` → `CANCELLED_BY_CLIENT`
  - `CONFIRMED` → `CANCELLED_BY_CLIENT`
- **Acciones:**
  - 💰 Reembolsos (si aplica)
  - 📧 Notificaciones a músicos afectados

### **8. ❌ CANCELADO POR MÚSICO (CANCELLED_BY_MUSICIAN)**
- **¿Cuándo?** El músico cancela su participación
- **Transiciones posibles:**
  - `OFFER_ACCEPTED` → `CANCELLED_BY_MUSICIAN`
  - `CONFIRMED` → `CANCELLED_BY_MUSICIAN`
- **Acciones:**
  - 📧 Notificación al cliente/líder
  - 🔄 Opción de reabrir solicitud

## 🔄 ESTADOS ESPECIALES

### **9. 🔄 REABIERTO (REOPENED)**
- **¿Cuándo?** Una solicitud cancelada se vuelve a abrir
- **Transición:** `CANCELLED_BY_CLIENT` o `CANCELLED_BY_MUSICIAN` → `REOPENED`
- **Acciones:**
  - 🔄 Volver a estado `CREATED` o `OFFER_RECEIVED`
  - 📧 Notificación a músicos disponibles

### **10. ⏰ EXPIRADO (EXPIRED)**
- **¿Cuándo?** La solicitud no fue completada en el tiempo límite
- **Transición:** Cualquier estado → `EXPIRED`
- **Acciones automáticas:**
  - ⏰ Verificación por cron job
  - 📧 Notificación de expiración

### **11. 📁 ARCHIVADO (ARCHIVED)**
- **¿Cuándo?** La solicitud se mueve a archivo histórico
- **Transición:** `COMPLETED` o `EXPIRED` → `ARCHIVED`
- **Acciones:**
  - 📊 Para reportes históricos
  - 🗑️ Limpieza de datos temporales

## 🔧 TRIGGERS Y FUNCIONES AUTOMÁTICAS

### **📊 Triggers de Estado:**

1. **`trg_calculate_request_price`** - Calcula precio automáticamente
2. **`trg_notify_musicians_new_request`** - Notifica nueva solicitud
3. **`trg_notify_leader_new_offer`** - Notifica nueva oferta
4. **`trg_notify_musician_offer_selected`** - Notifica oferta aceptada
5. **`trg_notify_event_status_change`** - Notifica cambio a IN_PROGRESS

### **⏰ Funciones Programadas:**

1. **`send_event_reminder(p_request_id)`** - Recordatorio 10 min antes
2. **`calculate_request_price()`** - Cálculo dinámico de precios
3. **`update_user_balance()`** - Actualización de balances

## 📱 INTERFAZ DE USUARIO

### **🎨 Estados Visuales:**

- **CREATED** → 🟡 Amarillo (Pendiente)
- **OFFER_RECEIVED** → 🔵 Azul (Ofertas recibidas)
- **OFFER_ACCEPTED** → 🟢 Verde (Oferta aceptada)
- **CONFIRMED** → 🟣 Morado (Confirmado)
- **IN_PROGRESS** → 🟠 Naranja (En progreso)
- **COMPLETED** → ✅ Verde (Completado)
- **CANCELLED_BY_CLIENT** → 🔴 Rojo (Cancelado por cliente)
- **CANCELLED_BY_MUSICIAN** → 🔴 Rojo (Cancelado por músico)
- **REOPENED** → 🔄 Azul (Reabierto)
- **EXPIRED** → ⚫ Gris (Expirado)
- **ARCHIVED** → 📁 Gris (Archivado)

## 🔒 PERMISOS POR ESTADO

### **👤 Cliente/Líder:**
- ✅ Crear solicitud (→ CREATED)
- ✅ Aceptar ofertas (→ OFFER_ACCEPTED)
- ✅ Confirmar evento (→ CONFIRMED)
- ✅ Cancelar (→ CANCELLED_BY_CLIENT)
- ✅ Marcar como completado (→ COMPLETED)
- ✅ Reabrir (→ REOPENED)

### **🎵 Músico:**
- ✅ Enviar ofertas (→ OFFER_RECEIVED)
- ✅ Confirmar participación (→ CONFIRMED)
- ✅ Cancelar participación (→ CANCELLED_BY_MUSICIAN)
- ✅ Marcar como completado (→ COMPLETED)

### **👨‍💼 Administrador:**
- ✅ Todos los permisos
- ✅ Archivar solicitudes (→ ARCHIVED)
- ✅ Marcar como expirado (→ EXPIRED)
- ✅ Reabrir cualquier solicitud

## 📊 MÉTRICAS Y REPORTES

### **📈 KPIs por Estado:**
- **CREATED** → Tiempo promedio hasta primera oferta
- **OFFER_RECEIVED** → Número de ofertas por solicitud
- **OFFER_ACCEPTED** → Tasa de aceptación de ofertas
- **COMPLETED** → Tasa de finalización exitosa
- **CANCELLED** → Tasa de cancelación y razones

---

**📅 Última actualización:** 2025-10-16  
**👨‍💻 Autor:** Sistema Share Musician  
**🔄 Versión:** 1.0
