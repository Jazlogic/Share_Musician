import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { storageService } from '../services/storageService';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import  pool  from '../config/db'; // Importar el pool de la base de datos
import { getS3Client } from '../services/storageService'; // Importar la función getS3Client

// Configuración de Multer para manejar la subida de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


export const createUserController = async (req: Request, res: Response) => {
  try {
    const { password, ...userData } = req.body;
    const user = await userService.createUser(userData, password);
    // Exclude password, email_verified and verification_token from the response for security reasons
    const { user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at } = user;
    res.status(201).json({ user_id, name, email, phone, role, active_role, status, church_id, created_at, updated_at });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await userService.updateUser(id, userData);
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfileKeyController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { profileKey } = req.body;

    if (!profileKey) {
      return res.status(400).json({ message: 'profileKey es requerido' });
    }

    const updatedUser = await userService.updateProfileKey(id, profileKey);
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Se requiere el token de verificación' });
    }

    const result = await userService.verifyEmail(token);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImageController = async (req: Request, res: Response) => {
  try {
    // console.log(`Req: `);
    // console.log(req);
    console.log('req.file en uploadProfileImageController:', req.file);
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No se ha proporcionado ningún archivo.' });
    }

    // Generar una clave única para el archivo en S3
    const fileExtension = file.originalname.split('.').pop();
    const profilekey = `profile-images/${id}/${uuidv4()}.${fileExtension}`;

    const s3 = getS3Client({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT,
      forcePathStyle: true,
    });

    const uploadParams = {
      Bucket: process.env.IDRIVE_BUCKET_NAME,
      Key: profilekey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    console.log('Imagen subida a S3 con profileKey:', profilekey);


    // Actualizar la profileKey del usuario en la base de datos
    const updatedUser = await userService.updateProfileKey(id, profilekey);

    if (updatedUser) {
      // Insertar la profilekey en el historial de imágenes de perfil
      await pool.query(
        'INSERT INTO user_profile_image_history (user_id, profilekey) VALUES ($1, $2)',
        [id, profilekey]
      );
      res.status(200).json({ message: 'Imagen de perfil subida y actualizada correctamente.', profilekey });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado o no se pudo actualizar la profileKey.' });
    }
  } catch (error: any) {
    console.error('Error al subir la imagen de perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al subir la imagen de perfil.' });
  }
};

export const getProfileImageController = async (req: Request, res: Response) => {
  const { profilekey } = req.params;

  try {
    if (!profilekey) {
      return res.status(400).json({ message: 'profileKey no proporcionada.' });
    }

    const { downloadURL } = await storageService.getDownloadUrl(profilekey);
    res.status(200).json({ downloadURL });
  } catch (error: any) {
    console.error('Error al obtener la URL de la imagen de perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener la URL de la imagen de perfil.' });
  }
};

export const serveProfileImage = async (req: Request, res: Response) => {
  const { profilekey } = req.params;

  try {
    if (!profilekey) {
      return res.status(400).json({ message: 'profileKey no proporcionada.' });
    }

    const { downloadURL } = await storageService.getDownloadUrl(profilekey);
    const response = await fetch(downloadURL);
    const imageBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    res.send(Buffer.from(imageBuffer));
  } catch (error: any) {
    console.error('Error al servir la imagen de perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al servir la imagen de perfil.' });
  }
};

export const getProfileImageHistoryController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT profilekey, uploaded_at FROM user_profile_image_history WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );

    const history = result.rows;

    if (history.length === 0) {
      return res.status(404).json({ message: 'No se encontró historial de imágenes de perfil para este usuario.' });
    }

    const s3 = getS3Client({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT,
      forcePathStyle: true,
    });

    const imageUrls = await Promise.all(history.map(async (item) => {
      const command = new GetObjectCommand({
        Bucket: process.env.IDRIVE_BUCKET_NAME,
        Key: item.profilekey,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL válida por 1 hora
      return { profileKey: item.profilekey, url, uploadedAt: item.uploaded_at };
    }));

    res.status(200).json(imageUrls);
  } catch (error) {
    console.error('Error al obtener el historial de imágenes de perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el historial de imágenes de perfil.' });
  }
};

export const selectProfileImageFromHistoryController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { profileKey } = req.body;

  try {
    if (!profileKey) {
      return res.status(400).json({ message: 'profileKey no proporcionada.' });
    }

    // Verificar si la profileKey existe en el historial del usuario
    const historyCheck = await pool.query(
      'SELECT 1 FROM user_profile_image_history WHERE user_id = $1 AND profilekey = $2',
      [id, profileKey]
    );

    if (historyCheck.rows.length === 0) {
      return res.status(404).json({ message: 'La profileKey seleccionada no se encontró en el historial de este usuario.' });
    }

    // Actualizar la profileKey del usuario en la tabla users
    const updateResult = await pool.query(
      'UPDATE users SET profilekey = $1 WHERE user_id = $2 RETURNING user_id, name, email, profilekey',
      [profileKey, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o no se pudo actualizar la profileKey.' });
    }

    res.status(200).json({ message: 'Foto de perfil actualizada correctamente desde el historial.', user: updateResult.rows[0] });
  } catch (error) {
    console.error('Error al seleccionar imagen de perfil del historial:', error);
    res.status(500).json({ message: 'Error interno del servidor al seleccionar imagen de perfil del historial.' });
  }
};