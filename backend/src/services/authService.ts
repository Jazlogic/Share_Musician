import  pool  from '../config/db';
import { User } from '../types/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      'SELECT user_id, email, name, phone, role, active_role, status, church_id, created_at, updated_at, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user: User = userResult.rows[0];

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const passwordResult = await client.query(
      'SELECT password FROM user_passwords WHERE user_id = $1',
      [user.user_id]
    );
    const storedPassword = passwordResult.rows[0]?.password;

    if (!storedPassword) {
      throw new Error('Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.email_verified) {
      throw new Error('Correo electrónico no verificado');
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    return { user, token };
  } finally {
    client.release();
  }
};