import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { storageService } from '../services/storageService';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Configuración de Multer para manejar la subida de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración del cliente S3 para iDrive e2
const s3Client = new S3Client({
  region: process.env.IDRIVE_REGION,
  endpoint: process.env.IDRIVE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.IDRIVE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.IDRIVE_SECRET_ACCESS_KEY || '',
  },
});

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
    const profileKey = `profile-images/${id}/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.IDRIVE_BUCKET_NAME,
      Key: profileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Imagen subida a S3 con profileKey:', profileKey);


    // Actualizar la profileKey del usuario en la base de datos
    const updatedUser = await userService.updateProfileKey(id, profileKey);

    if (updatedUser) {
      res.status(200).json({ message: 'Imagen de perfil subida y actualizada correctamente.', profileKey });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado o no se pudo actualizar la profileKey.' });
    }
  } catch (error: any) {
    console.error('Error al subir la imagen de perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor al subir la imagen de perfil.' });
  }
};

export const getProfileImageController = async (req: Request, res: Response) => {
    console.log('getProfileImageController called');
    console.log('Params: ');
    console.log(req.params);
    console.log(req.params.profilekey);
    try {
      const { profilekey } = req.params;

    if (!profilekey) {
      return res.status(400).json({ message: 'profileKey es requerido' });
    }

    const { downloadURL } = await storageService.getDownloadUrl(profilekey);
    res.status(200).json({ downloadURL });
  } catch (error: any) {
    console.error('Error fetching profile image URL:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener la URL de la imagen de perfil.' });
  }
};