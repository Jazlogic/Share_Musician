import { Request, Response } from 'express';
import pool from '../config/db';

export const getRequestStatuses = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT enum_range(NULL::request_status)::text[] AS statuses");
    res.json(result.rows[0].statuses);
  } catch (error) {
    console.error('Error fetching request statuses:', error);
    res.status(500).json({ message: 'Error fetching request statuses' });
  }
};