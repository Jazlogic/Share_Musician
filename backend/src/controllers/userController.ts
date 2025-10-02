import { Request, Response } from 'express';
import * as userService from '../services/userService';

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
      res.status(404).json({ message: 'User not found' });
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
      res.status(404).json({ message: 'User not found' });
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
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