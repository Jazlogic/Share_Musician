import { Request, Response } from 'express';
import { postService } from '../services/postService';

export const createPostController = async (req: Request, res: Response) => {
  try {
    const { userId, content, postKey } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'Faltan campos requeridos: userId, content' });
    }

    const newPost = await postService.createPost(userId, content, postKey);
    res.status(201).json({ message: 'Post creado exitosamente.', post: newPost });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};