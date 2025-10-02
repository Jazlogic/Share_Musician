import { Request, Response } from 'express';
import * as churchService from '../services/churchService';

export const createChurchController = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;
    const church = await churchService.createChurch(name, location);
    res.status(201).json(church);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getChurchesController = async (req: Request, res: Response) => {
  try {
    const churches = await churchService.getChurches();
    res.status(200).json(churches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getChurchByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const church = await churchService.getChurchById(id);
    if (church) {
      res.status(200).json(church);
    } else {
      res.status(404).json({ message: 'Iglesia no encontrada' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChurchController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    const updatedChurch = await churchService.updateChurch(id, name, location);
    if (updatedChurch) {
      res.status(200).json(updatedChurch);
    } else {
      res.status(404).json({ message: 'Iglesia no encontrada' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChurchController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await churchService.deleteChurch(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Iglesia no encontrada' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};