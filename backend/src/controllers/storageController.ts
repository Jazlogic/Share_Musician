import { Request, Response } from 'express';
import { storageService } from '../services/storageService';

export const storageController = {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { type, userId, fileType } = req.query;

      if (!type || !userId || !fileType) {
        return res.status(400).json({ message: 'Faltan parámetros de consulta: type, userId, fileType' });
      }

      let key: string;
      if (type === 'profile') {
        key = `profiles/${userId}/${Date.now()}.${fileType.toString().split('/')[1]}`;
      } else if (type === 'post') {
        key = `posts/${userId}/${Date.now()}.${fileType.toString().split('/')[1]}`;
      } else {
        return res.status(400).json({ message: "Tipo de archivo inválido. Debe ser 'profile' o 'post'." });
      }

      const { uploadURL, key: uploadedKey } = await storageService.getUploadUrl(key, fileType.toString());
      res.status(200).json({ uploadURL, key: uploadedKey });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async getDownloadUrl(req: Request, res: Response) {
    try {
      const { key } = req.query;

      if (!key) {
        return res.status(400).json({ message: 'Falta el parámetro de consulta: key' });
      }

      const { downloadURL } = await storageService.getDownloadUrl(key.toString());
      res.status(200).json({ downloadURL });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};