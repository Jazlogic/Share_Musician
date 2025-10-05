import pool from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../utils/email';

interface User {
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  role?: 'leader' | 'musician' | 'admin';
  active_role?: 'leader' | 'musician';
  status?: 'active' | 'pending' | 'rejected';
  church_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
  email_verified?: boolean;
  verification_token?: string | null;
  profileKey?: string | null;
}

export const createUser = async (userData: User, password: string): Promise<User> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4(); // Generate a unique verification token

    const { name, email, phone, role = 'musician', active_role = 'musician', status = 'pending', church_id = null, profileKey: profileKey = null } = userData;

    const userRes = await client.query(
      'INSERT INTO users (name, email, phone, role, active_role, status, church_id, email_verified, verification_token, profileKey) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9) RETURNING *'
      , [name, email, phone, role, active_role, status, church_id, verificationToken, profileKey]
    );
    const newUser: User = userRes.rows[0];

    await client.query(
      'INSERT INTO user_passwords (user_id, password) VALUES ($1, $2)'
      , [newUser.user_id, hashedPassword]
    );

    // Send verification email
    await sendVerificationEmail(newUser.email, newUser.verification_token!);

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getUsers = async (): Promise<User[]> => {
  const res = await pool.query('SELECT user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at, email_verified, verification_token, profileKey FROM users');
  return res.rows;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const res = await pool.query('SELECT user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at, email_verified, verification_token, profileKey FROM users WHERE user_id = $1', [id]);
  return res.rows[0] || null;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { name, email, phone, role, active_role, status, church_id, email_verified, verification_token, profileKey: profileKey } = userData;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (email) { fields.push(`email = $${paramIndex++}`); values.push(email); }
    if (phone) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (role) { fields.push(`role = $${paramIndex++}`); values.push(role); }
    if (active_role) { fields.push(`active_role = $${paramIndex++}`); values.push(active_role); }
    if (status) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (church_id !== undefined) { fields.push(`church_id = $${paramIndex++}`); values.push(church_id); }
    if (email_verified !== undefined) { fields.push(`email_verified = $${paramIndex++}`); values.push(email_verified); }
    if (verification_token !== undefined) { fields.push(`verification_token = $${paramIndex++}`); values.push(verification_token); }
     if (profileKey !== undefined) { fields.push(`profileKey = $${paramIndex++}`); values.push(profileKey); }

    if (fields.length === 0) {
      await client.query('COMMIT');
      return getUserById(id);
    }

    values.push(id);
    const userRes = await client.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at, email_verified, verification_token`
      , values
    );
    const updatedUser: User = userRes.rows[0];

    await client.query('COMMIT');
    return updatedUser || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateProfileKey = async (id: string, profileKey: string): Promise<User | null> => {
  const client = await pool.connect();
  try {
    const userRes = await client.query(
      'UPDATE users SET profileKey = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at, email_verified, verification_token, profileKey'
      , [profileKey, id]
    );
    const updatedUser: User = userRes.rows[0];
    return updatedUser || null;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // user_passwords will be deleted by CASCADE
    const res = await client.query('DELETE FROM users WHERE user_id = $1', [id]);

    await client.query('COMMIT');
    return res.rowCount !== null && res.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      'SELECT * FROM users WHERE verification_token = $1'
      , [token]
    );
    const user: User = userRes.rows[0];

    if (!user) {
      await client.query('ROLLBACK');
      return { success: false, message: 'Token de verificación inválido o expirado' };
    }

    if (user.email_verified) {
      await client.query('ROLLBACK');
      return { success: false, message: 'Correo electrónico ya verificado' };
    }

    await client.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, updated_at = NOW() WHERE user_id = $1 RETURNING *'
      , [user.user_id]
    );

    await client.query('COMMIT');
    return { success: true, message: 'Correo electrónico verificado exitosamente' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};