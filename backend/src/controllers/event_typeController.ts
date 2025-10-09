import { Request, Response } from 'express';
import pool from '../config/db';

export const getEventTypes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name FROM event_types');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ message: 'Error fetching event types' });
  }
};