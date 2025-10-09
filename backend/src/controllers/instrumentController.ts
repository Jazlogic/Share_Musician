import { Request, Response } from 'express';
import pool from '../config/db';

export const getInstruments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, category, icon FROM instruments');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching instruments:', error);
    res.status(500).json({ message: 'Error fetching instruments' });
  }
};