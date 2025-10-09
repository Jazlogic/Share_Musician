import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface RequestData {
  leader_id: string;
  event_type_id: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: object;
  description?: string;
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

export const createRequest = async (requestData: RequestData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      leader_id,
      event_type_id,
      event_date,
      start_time,
      end_time,
      location,
      description,
      instrument_ids,
      duration,
      base_rate,
      duration_hours,
      distance_km,
      experience_factor,
      instrument_factor,
      system_fee,
      total_price,
      extra_amount,
      is_public,
      status = 'CREATED',
      cancelled_by,
      cancellation_reason,
      reopened_from_id,
    } = requestData;

    const requestQuery = `
      INSERT INTO requests (
        leader_id,
        event_type_id,
        event_date,
        start_time,
        end_time,
        location,
        description,
        duration,
        base_rate,
        duration_hours,
        distance_km,
        experience_factor,
        instrument_factor,
        system_fee,
        total_price,
        extra_amount,
        is_public,
        status,
        cancelled_by,
        cancellation_reason,
        reopened_from_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id;
    `;

    const requestValues = [
      leader_id,
      event_type_id,
      event_date,
      start_time,
      end_time,
      JSON.stringify(location),
      description || null,
      duration || null,
      base_rate || null,
      duration_hours || null,
      distance_km || null,
      experience_factor || 1,
      instrument_factor || 1,
      system_fee || null,
      total_price || null,
      extra_amount || 0,
      is_public !== undefined ? is_public : true,
      status,
      cancelled_by || null,
      cancellation_reason || null,
      reopened_from_id || null,
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