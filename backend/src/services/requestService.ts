import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface RequestData {
  client_id: string;
  musician_id?: string;
  title: string;
  description: string;
  category?: string;
  instrument?: string;
  location?: object;
  event_date: string;
  start_time: string;
  end_time: string;
  event_duration?: string;
  price?: number;
  tip?: number;
  status?: string;
  updated_by?: string;
  expiration_date?: string;
  cancellation_reason?: string;
  client_rating?: number;
  musician_rating?: number;
  client_comment?: string;
  musician_comment?: string;
  is_public?: boolean;
  reopened_from_id?: string;
}

export const createRequest = async (requestData: RequestData) => {
  const {
    client_id,
    musician_id,
    title,
    description,
    category,
    instrument,
    location,
    event_date,
    start_time,
    end_time,
    event_duration,
    price,
    tip,
    status = 'CREATED',
    updated_by,
    expiration_date,
    cancellation_reason,
    client_rating,
    musician_rating,
    client_comment,
    musician_comment,
    is_public = true,
    reopened_from_id,
  } = requestData;

  const query = `
    INSERT INTO request (
      client_id,
      musician_id,
      title,
      description,
      category,
      instrument,
      location,
      event_date,
      start_time,
      end_time,
      event_duration,
      price,
      tip,
      status,
      updated_by,
      expiration_date,
      cancellation_reason,
      client_rating,
      musician_rating,
      client_comment,
      musician_comment,
      is_public,
      reopened_from_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    ) RETURNING *;
  `;

  const values = [
    client_id,
    musician_id || null,
    title,
    description,
    category || null,
    instrument || null,
    location ? JSON.stringify(location) : null,
    event_date,
    start_time,
    end_time,
    event_duration || null,
    price || null,
    tip || null,
    status,
    updated_by || null,
    expiration_date || null,
    cancellation_reason || null,
    client_rating || null,
    musician_rating || null,
    client_comment || null,
    musician_comment || null,
    is_public,
    reopened_from_id || null,
  ];
// console.log('values:', values); 
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error('Could not create request');
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