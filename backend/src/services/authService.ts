import pool from '../config/db';
import { User } from '../types/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (email: string, name: string, phone: string): Promise<User> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const userResult = await client.query(
      'INSERT INTO users (email, name, phone, role, status, email_verified, verification_token, verification_token_expires_at) VALUES ($1, $2, $3, $4, $5, FALSE, $6, $7) RETURNING user_id, email, name, phone, role, created_at, status',
      [normalizedEmail, name, phone, 'musician', 'pending', verificationCode, verificationExpiresAt]
    );
    const newUser: User = userResult.rows[0];

    await sendVerificationEmail(newUser.email, verificationCode);

    await client.query('COMMIT');
    return newUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const setPassword = async (email: string, password: string, code: string): Promise<{ user: User; token: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, email_verified, verification_token, verification_token_expires_at FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.email_verified) {
      throw new Error('Correo electrónico no verificado. Por favor, verifica tu correo antes de establecer la contraseña.');
    }

    if (user.verification_token !== code) {
      throw new Error('Código de verificación inválido.');
    }

    if (user.verification_token_expires_at && new Date() > new Date(user.verification_token_expires_at)) {
      throw new Error('El código de verificación ha expirado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si ya existe una contraseña para este usuario
    const existingPassword = await client.query(
      'SELECT 1 FROM user_passwords WHERE user_id = $1',
      [user.user_id]
    );

    if (existingPassword.rows.length > 0) {
      // Si ya existe, actualizarla
      await client.query(
        'UPDATE user_passwords SET password = $1 WHERE user_id = $2',
        [hashedPassword, user.user_id]
      );
    } else {
      // Si no existe, insertarla
      await client.query(
        'INSERT INTO user_passwords (user_id, password) VALUES ($1, $2)',
        [user.user_id, hashedPassword]
      );
    }

    await client.query(
      'UPDATE users SET status = $1, verification_token = NULL, verification_token_expires_at = NULL WHERE user_id = $2',
      ['active', user.user_id]
    );

    const updatedUserResult = await client.query(
      'SELECT user_id, email, name, phone, role, active_role, status, church_id, created_at, updated_at, email_verified FROM users WHERE user_id = $1',
      [user.user_id]
    );
    const updatedUser: User = updatedUserResult.rows[0];

    const token = jwt.sign({ userId: updatedUser.user_id, role: updatedUser.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    await client.query('COMMIT');
    return { user: updatedUser, token };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const verifyEmail = async (email: string, code: string): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, verification_token, verification_token_expires_at FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.verification_token !== code) {
      throw new Error('Código de verificación inválido');
    }

    if (user.verification_token_expires_at && new Date() > new Date(user.verification_token_expires_at)) {
      throw new Error('Código de verificación expirado');
    }

    // Mark email as verified but keep verification_token until password is set
    await client.query(
      'UPDATE users SET email_verified = TRUE WHERE user_id = $1',
      [user.user_id]
    );

    await client.query('COMMIT');
    return user.user_id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      'SELECT user_id, email, name, phone, role, active_role, status, church_id, created_at, updated_at, email_verified FROM users WHERE email = $1',
      [normalizedEmail]
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

    if (user.status !== 'active') {
      throw new Error('Usuario inactivo');
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '24h' });

    return { user, token };
  } finally {
    client.release();
  }
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.email_verified) {
      throw new Error('El correo electrónico ya ha sido verificado.');
    }

    const newVerificationCode = generateVerificationCode();
    const newVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      'UPDATE users SET verification_token = $1, verification_token_expires_at = $2 WHERE user_id = $3',
      [newVerificationCode, newVerificationExpiresAt, user.user_id]
    );

    await sendVerificationEmail(user.email, newVerificationCode);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, email FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora de validez

    console.log('User ID for password reset:', user.user_id);
    console.log('Generated resetToken:', resetToken);
    console.log('Generated resetTokenExpires:', resetTokenExpires);

    const updateResult = await client.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires_at = $2 WHERE user_id = $3',
      [resetToken, resetTokenExpires, user.user_id]
    );

    console.log('Update query result:', updateResult);

    if (updateResult.rowCount === 0) {
      console.error('Failed to update reset token for user:', user.user_id);
      throw new Error('No se pudo actualizar el token de restablecimiento');
    }

    await sendPasswordResetEmail(user.email, resetToken);

    await client.query('COMMIT');
    console.log('Token de restablecimiento almacenado correctamente para el usuario:', user.user_id);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error al solicitar restablecimiento de contraseña:', error.message, error);
    throw error;
  } finally {
    client.release();
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("Resetting password - Received token:", token);
    console.log("Resetting password - New password:", newPassword);

    console.log("Resetting password - Executing query to find user...");
    const userResult = await client.query(
      `
      SELECT user_id, reset_password_token, reset_password_expires_at
      FROM users
      WHERE reset_password_token = $1 AND reset_password_expires_at > NOW()
      `,
      [token]
    );
    console.log("Resetting password - Query executed. User result rows:", userResult.rows);

    const user = userResult.rows[0];

    if (!user) {
      console.log('Resetting password - No user found or token invalid/expired in query.');
      throw new Error('Token de restablecimiento de contraseña inválido.');
    }

    if (new Date() > new Date(user.reset_password_expires_at)) {
      console.log('Resetting password - Token expired after retrieval.');
      throw new Error('El token de restablecimiento de contraseña ha expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la tabla user_passwords
    await client.query(
      'UPDATE user_passwords SET password = $1 WHERE user_id = $2',
      [hashedPassword, user.user_id]
    );

    // Limpiar el token de restablecimiento de contraseña
    await client.query(
      'UPDATE users SET reset_password_token = NULL, reset_password_expires_at = NULL WHERE user_id = $1',
      [user.user_id]
    );

    await client.query('COMMIT');
    console.log('Resetting password - Password reset successfully and token cleared.');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Resetting password - Error during password reset:', error.message);
    throw error;
  } finally {
    client.release();
    console.log('Resetting password - Client released.');
  }
};

export const verifyResetCode = async (email: string, code: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    console.log('Verifying reset code for email:', normalizedEmail);
    console.log('Received code:', code);

    const userResult = await client.query(
      'SELECT reset_password_token, reset_password_expires_at FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = userResult.rows[0];

    if (!user) {
      console.log('User not found for email:', normalizedEmail);
      throw new Error('Usuario no encontrado.');
    }

    console.log('Stored reset_password_token:', user.reset_password_token);
    console.log('Stored reset_password_expires_at:', user.reset_password_expires_at);

    if (user.reset_password_token !== code) {
      console.log('Code mismatch: Stored vs Received', user.reset_password_token, code);
      throw new Error('Código de verificación inválido.');
    }

    if (new Date() > new Date(user.reset_password_expires_at)) {
      console.log('Code expired. Current time:', new Date(), 'Expires at:', user.reset_password_expires_at);
      throw new Error('El código de verificación ha expirado.');
    }

    // Si todo es válido, no se necesita hacer nada más que resolver la promesa.
  } finally {
    client.release();
  }
};