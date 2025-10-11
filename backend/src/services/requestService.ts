import { Pool } from 'pg';
import dotenv from 'dotenv';
import moment from 'moment'; // Importa moment para cálculos de fecha/hora

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
const getEventTypeIdByCategory = async (categoryName: string): Promise<string> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id FROM event_types WHERE name = $1',
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
const getInstrumentIdsByInstrumentName = async (instrumentName: string): Promise<string[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT instrument_id FROM instruments WHERE name = $1',
      [instrumentName]
    );
    if (result.rows.length === 0) {
      throw new Error(`Instrument with name '${instrumentName}' not found.`);
    }
    return [result.rows[0].instrument_id]; // Asumiendo un solo instrumento por ahora
  } finally {
    client.release();
  }
};

// Función auxiliar para obtener el factor de precio del instrumento
const getInstrumentPriceFactor = async (instrumentName: string): Promise<number> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT price_factor FROM instruments WHERE name = $1',
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
const getEventTypePriceFactor = async (categoryName: string): Promise<number> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT price_factor FROM event_types WHERE name = $1',
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
  const instrumentFactor = await getInstrumentPriceFactor(instrumentName);
  const eventTypeFactor = await getEventTypePriceFactor(categoryName);

  const startDateTime = moment(`${eventDate} ${startTime}`);
  const endDateTime = moment(`${eventDate} ${endTime}`);

  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    throw new Error('Invalid date or time format for price calculation.');
  }

  const durationHours = moment.duration(endDateTime.diff(startDateTime)).asHours();

  // Tarifa base, se puede configurar o obtener de una tabla de configuración
  const baseRate = 50; // Tarifa base de ejemplo

  // Cálculo de precio simple: tarifaBase * duración * factorInstrumento * factorTipoEvento
  let totalPrice = baseRate * durationHours * instrumentFactor * eventTypeFactor;

  // Asegurarse de que el precio no sea negativo o cero
  if (totalPrice <= 0) {
    totalPrice = baseRate; // Recurrir a la tarifa base si el cálculo produce un resultado no positivo
  }

  return parseFloat(totalPrice.toFixed(2));
};

export const createRequest = async (requestData: RequestData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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
    if (!client_id || !event_type_id || !event_date || !start_time || !end_time || !title || !location || description === undefined || is_public === undefined) {
      throw new Error('Missing required fields: client_id, title, description, event_type_id, event_date, start_time, end_time, location, is_public');
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
      optionalFields.status || 'CREATED',
      is_public,
    ];

    const result = await client.query(requestQuery, requestValues);
    const requestId = result.rows[0].id;

    if (instrument_ids && instrument_ids.length > 0) {
      const instrumentInsertPromises = instrument_ids.map(instrument_id =>
        client.query(
          'INSERT INTO request_instruments (request_id, instrument_id) VALUES ($1, $2)',
          [requestId, instrument_id]
        )
      );
      await Promise.all(instrumentInsertPromises);
    }

    // Registrar notificación de creación de solicitud
    await client.query(
      'INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)',
      [client_id, 'request_created', `Has creado una nueva solicitud: ${title}`]
    );

    await client.query('COMMIT');
    return { id: requestId, ...requestData, total_price: calculatedPrice };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating request:', error);
    throw new Error('Could not create request');
  } finally {
    client.release();
  }
};

export const getCreatedRequests = async (userId: string, userRole: string) => {
  let query = `SELECT * FROM request WHERE status = 'CREATED'`;
  const values: string[] = [];

  if (userRole === 'musician') {
    // Los músicos pueden ver todas las solicitudes 'CREATED'
    // No se necesita una cláusula WHERE adicional para los músicos
  } else if (userRole === 'leader') {
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
    console.error('Error fetching created requests:', error);
    throw new Error('Could not fetch created requests');
  }
};

export const getEventTypes = async (): Promise<{ id: string; name: string }[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, name FROM event_types');
    return result.rows;
  } finally {
    client.release();
  }
};