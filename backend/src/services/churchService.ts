import pool from '../config/db';

interface Church {
  churches_id?: string;
  name: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createChurch = async (name: string, location?: string): Promise<Church> => {
  const res = await pool.query(
    'INSERT INTO churches (name, location) VALUES ($1, $2) RETURNING *'
    , [name, location]
  );
  return res.rows[0];
};

export const getChurches = async (): Promise<Church[]> => {
  const res = await pool.query('SELECT * FROM churches');
  return res.rows;
};

export const getChurchById = async (id: string): Promise<Church | null> => {
  const res = await pool.query('SELECT * FROM churches WHERE churches_id = $1', [id]);
  return res.rows[0] || null;
};

export const updateChurch = async (id: string, name: string, location?: string): Promise<Church | null> => {
  const res = await pool.query(
    'UPDATE churches SET name = $1, location = $2, updated_at = NOW() WHERE churches_id = $3 RETURNING *'
    , [name, location, id]
  );
  return res.rows[0] || null;
};

export const deleteChurch = async (id: string): Promise<boolean> => {
  const res = await pool.query('DELETE FROM churches WHERE churches_id = $1', [id]);
  return res.rowCount !== null && res.rowCount > 0;
};