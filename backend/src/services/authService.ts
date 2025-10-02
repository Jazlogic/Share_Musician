import pool from '../config/db';
import { User } from '../types/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateVerificationCode, sendVerificationEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (email: string, name: string, phone: string): Promise<User> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const verificationCode = generateVerificationCode();

    const userResult = await client.query(
      'INSERT INTO users (email, name, phone, role, status, email_verified, verification_token) VALUES ($1, $2, $3, $4, $5, FALSE, $6) RETURNING user_id, email, name, phone, role, created_at, status',
      [email, name, phone, 'musician', 'pending', verificationCode]
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, email_verified, verification_token FROM users WHERE email = $1',
      [email]
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
      'UPDATE users SET status = $1, verification_token = NULL WHERE user_id = $2',
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, verification_token FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.verification_token !== code) {
      throw new Error('Código de verificación inválido');
    }

    await client.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE user_id = $1',
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

    await client.query(
      'UPDATE users SET verification_token = $1 WHERE user_id = $2',
      [newVerificationCode, user.user_id]
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, email FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora de validez

    await client.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE user_id = $3',
      [resetToken, resetTokenExpires, user.user_id]
    );

    // Enviar correo electrónico con el token de restablecimiento
    // Por ahora, usaremos sendVerificationEmail como placeholder
    await sendVerificationEmail(user.email, resetToken); // TODO: Crear una función sendPasswordResetEmail

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT user_id, reset_password_expires FROM users WHERE reset_password_token = $1',
      [token]
    );
    const user = userResult.rows[0];

    if (!user) {
      throw new Error('Token de restablecimiento de contraseña inválido.');
    }

    if (new Date() > new Date(user.reset_password_expires)) {
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
      'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = $1',
      [user.user_id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};