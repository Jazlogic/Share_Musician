import  pool  from '../config/db';
import { User } from '../types/db';
import bcrypt from 'bcrypt';

export const registerUser = async (email: string, name: string, phone: string, password: string): Promise<User> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      'INSERT INTO users (email, name, phone, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, name, phone, role, created_at, status',
      [email, name, phone, 'musician', 'active']
    );
    const newUser: User = userResult.rows[0];

    await client.query(
      'INSERT INTO user_passwords (user_id, password) VALUES ($1, $2)',
      [newUser.user_id, hashedPassword]
    );

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};