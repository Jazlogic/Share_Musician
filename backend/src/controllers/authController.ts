// Importa los módulos necesarios de Express para manejar solicitudes y respuestas HTTP.
import { Request, Response } from "express";
// Importa la configuración del pool de conexiones a la base de datos PostgreSQL.
import pool from "../config/db";
// Importa las funciones de servicio de autenticación que contienen la lógica de negocio.
import {
  // Esta es la funcion que recibe como parametros (email: string, name: string, phone: string) para la creacion y registro de los usuarios.
  registerUser,
  // Esta es la funcion que recibe como parametros (email: string, password: string) para que los suarios puedan iniciar sesion y tener acceso a sus funcionalidades permitidas segun su rol y nivel de acceso..
  loginUser,
  // Esta es la funcion que recibe como parametros (token: string) para verificar la cuenta de usuario y activar su acceso a la aplicacion.
  verifyEmail,
  // Esta es la funcion que recibe como parametros (token: string, password: string) para restablecer la contraseña de un usuario que ha solicitado un restablecimiento.
  setPassword,
  // Esta es la funcion que recibe como parametros (email: string) para reenviar el correo de verificación de cuenta.
  resendVerificationEmail,
  // Esta es la funcion que recibe como parametros (email: string) para solicitar un restablecimiento de contraseña.
  requestPasswordReset,
  // Esta es la funcion que recibe como parametros (token: string, password: string) para restablecer la contraseña de un usuario que ha solicitado un restablecimiento.
  resetPassword,
  verifyResetCode
} from "../services/authService";

/**
 * @function testDbConnection
 * @description Controlador para probar la conexión a la base de datos.
 *              Realiza una consulta simple para verificar si la base de datos está accesible.
 * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve cuando la conexión ha sido probada y se ha enviado una respuesta.
 */
export const testDbConnection = async (req: Request, res: Response) => {
  try {
    // Intenta ejecutar una consulta simple para verificar la conexión a la base de datos.
    await pool.query("SELECT 1");
    // Si la consulta es exitosa, envía una respuesta con estado 200 y un mensaje de éxito.
    res.status(200).json({ message: "Conexión a la base de datos exitosa." });
  } catch (error: any) {
    // Si ocurre un error durante la conexión, registra el error en la consola.
    console.error("Error al conectar a la base de datos:", error.message);
    // Envía una respuesta con estado 500 y un mensaje de error, incluyendo los detalles del error.
    res
      .status(500)
      .json({
        message: "Error al conectar a la base de datos.",
        error: error.message,
      });
  }
};

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicita un restablecimiento de contraseña enviando un correo electrónico con un token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario que solicita el restablecimiento de contraseña.
 *             required:
 *               - email
 *     responses:
 *       200 OK:
 *         description: Correo electrónico de restablecimiento de contraseña enviado exitosamente.
 *       404 Not Found:
 *         description: Usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function requestPasswordResetController
 * @description Controlador para manejar la solicitud de restablecimiento de contraseña.
 *              Recibe un correo electrónico y envía un token de restablecimiento al usuario.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar enviar el correo de restablecimiento.
 */
export const requestPasswordResetController = async (
  req: Request,
  res: Response
) => {
  // Extrae el correo electrónico del cuerpo de la solicitud.
  const { email } = req.body;

  try {
    // Llama al servicio de autenticación para iniciar el proceso de restablecimiento de contraseña.
    await requestPasswordReset(email);
    // Si es exitoso, envía una respuesta con estado 200 y un mensaje de confirmación.
    res
      .status(200)
      .json({
        message:
          "Correo electrónico de restablecimiento de contraseña enviado exitosamente.",
      });
  } catch (error: any) {
    // Maneja el caso en que el usuario no sea encontrado.
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error requesting password reset:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/resend-verification-email:
 *   post:
 *     summary: Reenvía el código de verificación de correo electrónico a un usuario existente.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario al que se le reenviará el código.
 *             required:
 *               - email
 *     responses:
 *       200 OK:
 *         description: Código de verificación reenviado exitosamente.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos o el correo electrónico ya ha sido verificado.
 *       404 Not Found:
 *         description: Usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */

/**
 * @function resendVerificationEmailController
 * @description Controlador para reenviar el código de verificación de correo electrónico a un usuario.
 *              Verifica si el usuario existe y si el correo no ha sido verificado ya.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar reenviar el correo de verificación.
 */
export const resendVerificationEmailController = async (
  req: Request,
  res: Response
) => {
  // Extrae el correo electrónico del cuerpo de la solicitud.
  const { email } = req.body;

  try {
    // Llama al servicio de autenticación para reenviar el correo de verificación.
    await resendVerificationEmail(email);
    // Si es exitoso, envía una respuesta con estado 200 y un mensaje de confirmación.
    res
      .status(200)
      .json({ message: "Código de verificación reenviado exitosamente." });
  } catch (error: any) {
    // Maneja el caso en que el usuario no sea encontrado.
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    // Maneja el caso en que el correo electrónico ya ha sido verificado.
    if (error.message === "El correo electrónico ya ha sido verificado.") {
      return res.status(400).json({ message: error.message });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error resending verification email:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario con correo electrónico, nombre y teléfono. La contraseña se establecerá después de la verificación del correo.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               name:
 *                 type: string
 *                 description: Nombre del usuario.
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario.
 *             required:
 *               - email
 *               - name
 *               - phone
 *     responses:
 *       201 Created:
 *         description: Usuario registrado exitosamente. Se ha enviado un código de verificación al correo.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos.
 *       409 Conflict:
 *         description: El correo electrónico ya está registrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function register
 * @description Controlador para registrar un nuevo usuario en el aplicación.
 *              Recibe el correo electrónico, nombre y teléfono del usuario.
 *              La contraseña se establecerá en un paso posterior, después de la verificación del correo.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email`, `name` y `phone` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar registrar al usuario.
 */
export const register = async (req: Request, res: Response) => {
  // Extrae el correo electrónico, nombre y teléfono del cuerpo de la solicitud.
  const { email, name, phone } = req.body;

  try {
    // Llama al servicio de autenticación para registrar al nuevo usuario.
    const newUser = await registerUser(email, name, phone);
    // Si el registro es exitoso, envía una respuesta con estado 201 y un mensaje de éxito, incluyendo el ID del nuevo usuario.
    res
      .status(201)
      .json({
        message:
          "Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.",
        userId: newUser.user_id,
      });
  } catch (error: any) {
    // Maneja el caso en que el correo electrónico ya esté registrado.
    if (error.message === "Email already registered") {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está registrado" });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error during user registration:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/set-password:
 *   post:
 *     summary: Establece la contraseña para un usuario con el correo electrónico verificado.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña del usuario (mínimo 6 caracteres).
 *               code:
 *                 type: string
 *                 description: Código de verificación de 6 dígitos enviado al correo electrónico del usuario.
 *             required:
 *               - email
 *               - password
 *               - code
 *     responses:
 *       200 OK:
 *         description: Contraseña establecida exitosamente y usuario activado. Retorna el usuario y un token de autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña establecida exitosamente y usuario activado.
 *                 user:
 *                   type: object
 *                   description: Objeto del usuario.
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos o usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function setUserPassword
 * @description Controlador para establecer la contraseña de un usuario después de la verificación de su correo electrónico.
 *              Requiere el correo electrónico, la nueva contraseña y el código de verificación.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email`, `password` y `code` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar establecer la contraseña.
 */
export const setUserPassword = async (req: Request, res: Response) => {
  // Extrae el correo electrónico, la contraseña y el código de verificación del cuerpo de la solicitud.
  const { email, password, code } = req.body;

  try {
    // Valida que la contraseña sea una cadena y tenga al menos 6 caracteres.
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }
    // Llama al servicio de autenticación para establecer la contraseña y activar al usuario.
    const { user, token } = await setPassword(email, password, code);
    // Si es exitoso, envía una respuesta con estado 200, un mensaje de éxito, el objeto de usuario y un token de autenticación.
    res
      .status(200)
      .json({
        message: "Contraseña establecida exitosamente y usuario activado.",
        user,
        token,
      });
  } catch (error: any) {
    // Maneja el caso en que el correo electrónico no haya sido verificado.
    if (
      error.message ===
      "Correo electrónico no verificado. Por favor, verifica tu correo antes de establecer la contraseña."
    ) {
      return res.status(400).json({ message: error.message });
    }
    // Maneja el caso en que el usuario no sea encontrado.
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    // Maneja el caso en que el código de verificación sea inválido.
    if (error.message === "Código de verificación inválido.") {
      return res.status(400).json({ message: error.message });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error setting user password:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verifica el correo electrónico de un usuario con un código de 6 dígitos.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               code:
 *                 type: string
 *                 description: Código de verificación de 6 dígitos.
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200 OK:
 *         description: Correo electrónico verificado exitosamente.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos o código de verificación incorrecto.
 *       404 Not Found:
 *         description: Usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function verifyUserEmail
 * @description Controlador para verificar el correo electrónico de un usuario utilizando un código de 6 dígitos.
 *              Confirma la validez del código y activa la cuenta de correo del usuario.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email` y `code` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar verificar el correo electrónico.
 */
export const verifyUserEmail = async (req: Request, res: Response) => {
  // Extrae el correo electrónico y el código de verificación del cuerpo de la solicitud.
  const { email, code } = req.body;

  try {
    // Llama al servicio de autenticación para verificar el correo electrónico.
    const userId = await verifyEmail(email, code);
    // Si es exitoso, envía una respuesta con estado 200 y un mensaje de confirmación, incluyendo el ID del usuario.
    res
      .status(200)
      .json({ message: "Correo electrónico verificado exitosamente.", userId });
  } catch (error: any) {
    // Maneja el caso en que el usuario no sea encontrado.
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    // Maneja el caso en que el código de verificación sea inválido.
    if (error.message === "Código de verificación inválido") {
      return res.status(400).json({ message: error.message });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error during email verification:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200 OK:
 *         description: Login exitoso. Retorna el usuario y un token de autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 user:
 *                   type: object
 *                   description: Objeto del usuario.
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT.
 *       401 Unauthorized:
 *         description: Credenciales inválidas.
 *       403 Forbidden:
 *         description: Correo electrónico no verificado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function login
 * @description Controlador para iniciar sesión de un usuario.
 *              Verifica las credenciales (correo electrónico y contraseña) y devuelve un token de autenticación si son válidas.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email` y `password` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar iniciar sesión.
 */
export const login = async (req: Request, res: Response) => {
  // Extrae el correo electrónico y la contraseña del cuerpo de la solicitud.
  const { email, password } = req.body;

  try {
    // Llama al servicio de autenticación para intentar iniciar sesión.
    const { user, token } = await loginUser(email, password);
    // Si el inicio de sesión es exitoso, envía una respuesta con estado 200, un mensaje de éxito, el objeto de usuario y un token de autenticación.
    res.status(200).json({ message: "Login exitoso", user, token });
  } catch (error: any) {
    // Maneja el caso de credenciales inválidas (correo electrónico o contraseña incorrectos).
    if (error.message === "Credenciales inválidas") {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    // Maneja el caso en que el correo electrónico no ha sido verificado.
    if (error.message === "Correo electrónico no verificado") {
      return res
        .status(403)
        .json({
          message:
            "Correo electrónico no verificado. Por favor, verifica tu correo antes de iniciar sesión.",
        });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error en el login:", error);
    // Envía una respuesta con estado 500 para errores internos del servidor.
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña de un usuario utilizando un token válido.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de restablecimiento de contraseña recibido por correo electrónico.
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña del usuario (mínimo 6 caracteres).
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200 OK:
 *         description: Contraseña restablecida exitosamente.
 *       400 Bad Request:
 *         description: Token inválido o expirado, o datos de entrada inválidos.
 *       404 Not Found:
 *         description: Usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function resetPasswordController
 * @description Controlador para restablecer la contraseña de un usuario utilizando un token válido.
 *              Verifica la validez del token y actualiza la contraseña del usuario.
 * @param {Request} req - Objeto de solicitud de Express, esperando `token` y `newPassword` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar restablecer la contraseña.
 */
export const resetPasswordController = async (req: Request, res: Response) => {
  // Extrae el token y la nueva contraseña del cuerpo de la solicitud.
  const { token, newPassword } = req.body;

  try {
    // Valida que la nueva contraseña sea una cadena y tenga al menos 6 caracteres.
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }
    // Llama al servicio de autenticación para restablecer la contraseña.
    await resetPassword(token, newPassword);
    // Si es exitoso, envía una respuesta con estado 200 y un mensaje de confirmación.
    res.status(200).json({ message: "Contraseña restablecida exitosamente." });
  } catch (error: any) {
    // Maneja el caso de token inválido o expirado, o usuario no encontrado.
    if (
      error.message === "Token inválido o expirado" ||
      error.message === "Usuario no encontrado"
    ) {
      return res.status(400).json({ message: error.message });
    }
    // Registra cualquier otro error inesperado en la consola.
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verifica la validez de un código de restablecimiento de contraseña.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               code:
 *                 type: string
 *                 description: Código de verificación recibido.
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200 OK:
 *         description: Código de verificación válido.
 *       400 Bad Request:
 *         description: Código inválido o expirado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
/**
 * @function verifyResetCodeController
 * @description Controlador para verificar la validez de un código de restablecimiento de contraseña.
 *              Recibe un correo electrónico y un código, y verifica si el código es válido y no ha expirado.
 * @param {Request} req - Objeto de solicitud de Express, esperando `email` y `code` en el cuerpo.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Una promesa que resuelve después de intentar verificar el código.
 */
export const verifyResetCodeController = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    await verifyResetCode(email, code);
    res.status(200).json({ message: 'Código de verificación válido.' });
  } catch (error: any) {
    console.error('Error verifying reset code:', error);
    res.status(400).json({ message: error.message || 'Código inválido o expirado.' });
  }
};
