import { Pool } from "pg";
import dotenv from "dotenv";
import moment from "moment"; // Importa moment para cálculos de fecha/hora

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface RequestData {
  client_id: string;
  title: string;
  description: string;
  category?: string; // Temporal, se convertirá a event_type_id
  instrument?: string; // Temporal, se convertirá a instrument_ids
  event_type_id?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: object; // Hecho opcional
  instrument_ids?: string[]; // Array de UUIDs de instrumentos
  // Campos opcionales que podrían pasarse
  duration?: string;
  base_rate?: number;
  duration_hours?: number;
  distance_km?: number;
  experience_factor?: number;
  instrument_factor?: number;
  system_fee?: number;
  total_price?: number;
  extra_amount?: number;
  is_public: boolean;
  status?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  reopened_from_id?: string;
}

// Función auxiliar para obtener event_type_id del nombre de la categoría
const getEventTypeIdByCategory = async (
  categoryName: string
): Promise<string> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id FROM event_types WHERE name = $1",
      [categoryName]
    );
    if (result.rows.length === 0) {
      throw new Error(`Event type with name '${categoryName}' not found.`);
    }
    return result.rows[0].id;
  } finally {
    client.release();
  }
};

// Función auxiliar para obtener instrument_ids del nombre del instrumento
const getInstrumentIdsByInstrumentName = async (
  instrumentName: string
): Promise<string[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id FROM instruments WHERE name = $1",
      [instrumentName]
    );
    if (result.rows.length === 0) {
      throw new Error(`Instrument with name '${instrumentName}' not found.`);
    }
    return [result.rows[0].id]; // Corregido: usar 'id' en lugar de 'instrument_id'
  } finally {
    client.release();
  }
};

// Función auxiliar para obtener el factor de precio del instrumento
const getInstrumentPriceFactor = async (
  instrumentName: string
): Promise<number> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT price_factor FROM instruments WHERE name = $1",
      [instrumentName]
    );
    if (result.rows.length === 0) {
      throw new Error(`Instrument with name '${instrumentName}' not found.`);
    }
    return result.rows[0].price_factor || 1.0; // Factor predeterminado de 1.0
  } finally {
    client.release();
  }
};

// Función auxiliar para obtener el factor de precio del tipo de evento
const getEventTypePriceFactor = async (
  categoryName: string
): Promise<number> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT price_factor FROM event_types WHERE name = $1",
      [categoryName]
    );
    if (result.rows.length === 0) {
      throw new Error(`Event type with name '${categoryName}' not found.`);
    }
    return result.rows[0].price_factor || 1.0; // Factor predeterminado de 1.0
  } finally {
    client.release();
  }
};

// Función para calcular el precio de la solicitud
const calculateRequestPrice = async (
  instrumentName: string,
  categoryName: string,
  eventDate: string,
  startTime: string,
  endTime: string
): Promise<number> => {
  try {
    const instrumentFactor = await getInstrumentPriceFactor(instrumentName);
    const eventTypeFactor = await getEventTypePriceFactor(categoryName);

    const startDateTime = moment(`${eventDate} ${startTime}`);
    const endDateTime = moment(`${eventDate} ${endTime}`);

    if (!startDateTime.isValid() || !endDateTime.isValid()) {
      throw new Error("Invalid date or time format for price calculation.");
    }

    const durationHours = moment
      .duration(endDateTime.diff(startDateTime))
      .asHours();

    if (durationHours <= 0) {
      throw new Error("End time must be after start time.");
    }

    // Obtener tarifa base de la configuración de precios
    const client = await pool.connect();
    try {
      const configResult = await client.query(
        "SELECT base_hourly_rate FROM pricing_config WHERE is_active = true LIMIT 1"
      );
      const baseRate = configResult.rows.length > 0 
        ? parseFloat(configResult.rows[0].base_hourly_rate) 
        : 50.0; // Tarifa base de respaldo

      // Cálculo de precio: tarifaBase * duración * factorInstrumento * factorTipoEvento
      let totalPrice = baseRate * durationHours * instrumentFactor * eventTypeFactor;

      // Asegurarse de que el precio no sea negativo o cero
      if (totalPrice <= 0) {
        totalPrice = baseRate;
      }

      return parseFloat(totalPrice.toFixed(2));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error calculating request price:", error);
    throw new Error("Could not calculate request price");
  }
};

export const createRequest = async (requestData: RequestData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      client_id,
      title,
      description,
      category,
      instrument,
      event_date,
      start_time,
      end_time,
      location,
      is_public,
      ...optionalFields
    } = requestData;

    // Convertir categoría a event_type_id
    let event_type_id: string | undefined;
    if (category) {
      event_type_id = await getEventTypeIdByCategory(category);
    }

    // Convertir instrumento a instrument_ids
    let instrument_ids: string[] | undefined;
    if (instrument) {
      instrument_ids = await getInstrumentIdsByInstrumentName(instrument);
    }

    // Validación básica
    if (
      !client_id ||
      !event_type_id ||
      !event_date ||
      !start_time ||
      !end_time ||
      !title ||
      !location ||
      description === undefined ||
      is_public === undefined
    ) {
      throw new Error(
        "Missing required fields: client_id, title, description, event_type_id, event_date, start_time, end_time, location, is_public"
      );
    }

    // Calcular precio
    const calculatedPrice = await calculateRequestPrice(
      instrument as string,
      category as string,
      event_date,
      start_time,
      end_time
    );

    const requestQuery = `
      INSERT INTO request (
        client_id,
        title,
        event_type_id,
        event_date,
        start_time,
        end_time,
        location,
        description,
        total_price,
        status,
        is_public,
        created_at,
        updated_at,
        musician_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), NULL
      ) RETURNING id;
    `;

    const requestValues = [
      client_id,
      title,
      event_type_id,
      event_date,
      start_time,
      end_time,
      JSON.stringify(location),
      description,
      calculatedPrice,
      optionalFields.status || "CREATED",
      is_public,
    ];

    const result = await client.query(requestQuery, requestValues);
    const requestId = result.rows[0].id;

    if (instrument_ids && instrument_ids.length > 0) {
      const instrumentInsertPromises = instrument_ids.map((instrument_id) =>
        client.query(
          "INSERT INTO request_instruments (request_id, instrument_id) VALUES ($1, $2)",
          [requestId, instrument_id]
        )
      );
      await Promise.all(instrumentInsertPromises);
    }

    // Registrar notificación de creación de solicitud
    await client.query(
      "INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, $2, $3, $4, $5)",
      [
        client_id, 
        'SYSTEM', 
        'Solicitud Creada', 
        `Has creado una nueva solicitud: ${title}`, 
        `/requests/${requestId}`
      ]
    );

    await client.query("COMMIT");
    return { id: requestId, ...requestData, total_price: calculatedPrice };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating request:", error);
    throw new Error("Could not create request");
  } finally {
    client.release();
  }
};

export const getCreatedRequests = async (userId: string, userRole: string) => {
  let query = `SELECT * FROM request WHERE status = 'CREATED'`;
  const values: string[] = [];

  if (userRole === "musician") {
    // Los músicos pueden ver todas las solicitudes 'CREATED'
    // No se necesita una cláusula WHERE adicional para los músicos
  } else if (userRole === "leader") {
    // Los líderes solo pueden ver las solicitudes 'CREATED' que crearon
    query += ` AND client_id = $1`;
    values.push(userId);
  } else {
    // Otros roles (por ejemplo, administrador) podrían tener diferentes reglas o no tener acceso
    return [];
  }

  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("Error fetching created requests:", error);
    throw new Error("Could not fetch created requests");
  }
};

export const getEventTypes = async (): Promise<
  { id: string; name: string; price_factor?: number }[]
> => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT id, name, price_factor FROM event_types ORDER BY name");
    return result.rows;
  } finally {
    client.release();
  }
};

export const getInstruments = async (): Promise<
  { id: string; name: string; category: string; price_factor?: number }[]
> => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT id, name, category, price_factor FROM instruments ORDER BY category, name");
    return result.rows;
  } finally {
    client.release();
  }
};

export const getRequestById = async (requestId: string) => {
  const client = await pool.connect();


  try {
    const query = `
      SELECT
        r.id,
        r.client_id,
        r.musician_id,
        r.title,
        r.description,
        et.name as category,
        r.location,
        r.total_price,
        r.distance_km,
        r.event_date,
        r.start_time,
        r.end_time,
        r.total_price,
        r.status,
        r.created_at,
        r.updated_at,
        r.is_public,
        r.cancelled_by,
        r.cancellation_reason,
        r.reopened_from_id,
        json_agg(i.name) AS instruments
      FROM request r
      JOIN event_types et ON r.event_type_id = et.id
      LEFT JOIN request_instruments ri ON r.id = ri.request_id
      LEFT JOIN instruments i ON ri.instrument_id = i.id
      WHERE r.id = $1
      GROUP BY r.id, et.name
    `;
    const result = await client.query(query, [requestId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    throw new Error("Could not fetch request by ID");
  } finally {
    client.release();
  }
};

// Función para actualizar el estado de una solicitud
export const updateRequestStatus = async (
  requestId: string,
  newStatus: string,
  userId: string,
  userRole: string,
  cancellationReason?: string
): Promise<any> => {
  const client = await pool.connect();
  try {
    // Validar que la solicitud existe
    const requestCheck = await client.query(
      "SELECT id, status, client_id, musician_id FROM request WHERE id = $1",
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      throw new Error("Request not found");
    }

    const request = requestCheck.rows[0];

    // Validar transiciones de estado según el rol del usuario
    const validTransitions = getValidTransitions(request.status, userRole, request.client_id, request.musician_id, userId);
    
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${request.status} to ${newStatus} for role ${userRole}`);
    }

    // Actualizar el estado de la solicitud
    const updateQuery = `
      UPDATE request 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      ${cancellationReason ? ', cancellation_reason = $3' : ''}
      WHERE id = $2
      RETURNING *
    `;

    const params = cancellationReason ? [newStatus, requestId, cancellationReason] : [newStatus, requestId];
    const result = await client.query(updateQuery, params);

    // Si se cancela, actualizar el campo cancelled_by
    if (newStatus.includes('CANCELLED')) {
      await client.query(
        "UPDATE request SET cancelled_by = $1 WHERE id = $2",
        [userId, requestId]
      );
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Función auxiliar para determinar transiciones válidas
const getValidTransitions = (
  currentStatus: string,
  userRole: string,
  requestClientId: string,
  requestMusicianId: string,
  userId: string
): string[] => {
  const isClient = userRole === 'client' && requestClientId === userId;
  const isMusician = userRole === 'musician' && requestMusicianId === userId;
  const isAdmin = userRole === 'admin';

  const transitions: { [key: string]: string[] } = {
    'CREATED': ['OFFER_RECEIVED', 'CANCELLED_BY_CLIENT', 'EXPIRED'],
    'OFFER_RECEIVED': ['OFFER_ACCEPTED', 'CANCELLED_BY_CLIENT', 'EXPIRED'],
    'OFFER_ACCEPTED': ['CONFIRMED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_MUSICIAN'],
    'CONFIRMED': ['IN_PROGRESS', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_MUSICIAN'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_MUSICIAN'],
    'COMPLETED': ['REOPENED', 'ARCHIVED'],
    'CANCELLED_BY_CLIENT': ['REOPENED'],
    'CANCELLED_BY_MUSICIAN': ['REOPENED'],
    'REOPENED': ['CREATED', 'OFFER_RECEIVED'],
    'EXPIRED': ['REOPENED'],
    'ARCHIVED': []
  };

  let validStatuses = transitions[currentStatus] || [];

  // Filtrar según permisos del usuario
  if (isClient) {
    validStatuses = validStatuses.filter(status => 
      ['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'REOPENED'].includes(status)
    );
  } else if (isMusician) {
    validStatuses = validStatuses.filter(status => 
      ['CONFIRMED', 'COMPLETED', 'CANCELLED_BY_MUSICIAN'].includes(status)
    );
  } else if (!isAdmin) {
    validStatuses = [];
  }

  return validStatuses;
};
