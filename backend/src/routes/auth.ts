import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { testDbConnection, register, login, verifyUserEmail, setUserPassword, resendVerificationEmailController, requestPasswordResetController, resetPasswordController, verifyResetCodeController } from '../controllers/authController';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API para autenticación de usuarios
 */

/**
 * @swagger
 * /auth/test-db:
 *   get:
 *     summary: Probar conexión a la base de datos
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Conexión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database connection successful"
 *       500:
 *         description: Error de conexión
 */
router.get('/test-db', authLimiter, testDbConnection);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               phone:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: "+18091234567"
 *               role:
 *                 type: string
 *                 enum: [client, musician, leader, admin]
 *                 description: Rol del usuario
 *                 example: "client"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               phone:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: "+18091234567"
 *               role:
 *                 type: string
 *                 enum: [client, musician, leader, admin]
 *                 description: Rol del usuario
 *                 example: "client"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: "miPassword123"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: "miPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token para autenticación
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verificar correo electrónico
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pin
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico a verificar
 *                 example: "juan.perez@example.com"
 *               pin:
 *                 type: string
 *                 description: Código PIN de verificación
 *                 example: "123456"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pin
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico a verificar
 *                 example: "juan.perez@example.com"
 *               pin:
 *                 type: string
 *                 description: Código PIN de verificación
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: PIN inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify-email', authLimiter, verifyUserEmail);

/**
 * @swagger
 * /auth/set-password:
 *   post:
 *     summary: Establecer contraseña para usuario verificado
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: "miNuevaPassword123"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: "miNuevaPassword123"
 *     responses:
 *       200:
 *         description: Contraseña establecida exitosamente
 *       400:
 *         description: Email no verificado o datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/set-password', authLimiter, setUserPassword);

/**
 * @swagger
 * /auth/resend-verification-email:
 *   post:
 *     summary: Reenviar email de verificación
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *     responses:
 *       200:
 *         description: Email de verificación reenviado
 *       400:
 *         description: Email no encontrado o ya verificado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/resend-verification-email', authLimiter, resendVerificationEmailController);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *     responses:
 *       200:
 *         description: Solicitud de restablecimiento enviada
 *       400:
 *         description: Email no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/request-password-reset', authLimiter, requestPasswordResetController);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verificar código de restablecimiento
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               resetCode:
 *                 type: string
 *                 description: Código de restablecimiento
 *                 example: "ABC123"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               resetCode:
 *                 type: string
 *                 description: Código de restablecimiento
 *                 example: "ABC123"
 *     responses:
 *       200:
 *         description: Código verificado exitosamente
 *       400:
 *         description: Código inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify-reset-code', authLimiter, verifyResetCodeController);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con código verificado
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               resetCode:
 *                 type: string
 *                 description: Código de restablecimiento verificado
 *                 example: "ABC123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: "miNuevaPassword123"
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@example.com"
 *               resetCode:
 *                 type: string
 *                 description: Código de restablecimiento verificado
 *                 example: "ABC123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: "miNuevaPassword123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Código inválido o datos incorrectos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reset-password', authLimiter, resetPasswordController);

export default router;