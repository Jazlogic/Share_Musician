import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface RequestData {
  client_id: string;
  title: string;
  description?: string;
  category?: string; // Temporal, will be converted to event_type_id
  instrument?: string; // Temporal, will be converted to instrument_ids
  event_type_id?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location?: object; // Made optional
  instrument_ids?: string[]; // Array of instrument UUIDs
  // Optional fields that might be passed
  duration?: string;
  base_rate?: number;
  duration_hours?: number;
  distance_km?: number;
  experience_factor?: number;
  instrument_factor?: number;
  system_fee?: number;
  total_price?: number;
  extra_amount?: number;
  is_public?: boolean;
  status?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  reopened_from_id?: string;
}

// Helper function to get event_type_id from category name
const getEventTypeIdByCategory = async (category: string): Promise<string> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT event_type_id FROM event_types WHERE name = $1',
      [category]
    );
    if (result.rows.length === 0) {
      throw new Error(`Event type with category '${category}' not found.`);
    }
    return result.rows[0].event_type_id;
  } finally {
    client.release();
  }
};

// Helper function to get instrument_ids from instrument name
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
    return [result.rows[0].instrument_id]; // Assuming one instrument for now
  } finally {
    client.release();
  }
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
      total_price: price, // Renamed from total_price to price to match frontend
      ...optionalFields
    } = requestData;

    // Convert category to event_type_id
    let event_type_id: string | undefined;
    if (category) {
      event_type_id = await getEventTypeIdByCategory(category);
    }

    // Convert instrument to instrument_ids
    let instrument_ids: string[] | undefined;
    if (instrument) {
      instrument_ids = await getInstrumentIdsByInstrumentName(instrument);
    }

    // Basic validation
    if (!client_id || !event_type_id || !event_date || !start_time || !end_time || !title || !location) {
      throw new Error('Missing required fields: client_id, title, event_type_id, event_date, start_time, end_time, location');
    }

    const requestQuery = `
      INSERT INTO requests (
        leader_id,
        title,
        event_type_id,
        event_date,
        start_time,
        end_time,
        location,
        description,
        total_price,
        status,
        is_public
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
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
      description || null,
      price || null,
      optionalFields.status || 'CREATED',
      optionalFields.is_public !== undefined ? optionalFields.is_public : true,
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

    await client.query('COMMIT');
    return { id: requestId, ...requestData };
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
    // Musicians can see all 'CREATED' requests
    // No additional WHERE clause needed for musicians
  } else if (userRole === 'leader') {
    // Leaders can only see 'CREATED' requests they created
    query += ` AND client_id = $1`;
    values.push(userId);
  } else {
    // Other roles (e.g., admin) might have different rules, or no access
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