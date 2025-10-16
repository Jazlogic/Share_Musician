import { Request, Response } from 'express';
import { createRequest, getCreatedRequests, getEventTypes, getInstruments, getRequestById } from '../services/requestService';

export const createRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    const allowedRoles = ['client', 'musician'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Only clients and musicians can create requests' });
    }

    const { 
      title, 
      description, 
      category, 
      instrument, 
      event_date, 
      start_time, 
      end_time, 
      location, 
      is_public 
    } = req.body;

    // Validación básica de campos requeridos
    if (!title || !description || !category || !instrument || !event_date || !start_time || !end_time || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, category, instrument, event_date, start_time, end_time, location' 
      });
    }

    // Validar formato de fecha y hora
    const eventDate = new Date(event_date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid event_date format' });
    }

    // Validar que la fecha no sea en el pasado
    if (eventDate < new Date()) {
      return res.status(400).json({ message: 'Event date cannot be in the past' });
    }

    const newRequest = await createRequest({
      client_id: req.user.userId,
      title,
      description,
      category,
      instrument,
      event_date,
      start_time,
      end_time,
      location,
      is_public: is_public !== undefined ? is_public : true,
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error in createRequestController:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
};


export const getCreatedRequestsController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }
    const userId = req.user.userId;
    const userRole = req.user.role;

    const requests = await getCreatedRequests(userId, userRole);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getCreatedRequestsController:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEventTypesController = async (req: Request, res: Response) => {
  try {
    const eventTypes = await getEventTypes();
    res.status(200).json(eventTypes);
  } catch (error: any) {
    console.error('Error in getEventTypesController:', error);
    res.status(500).json({ message: 'Error fetching event types' });
  }
};

export const getInstrumentsController = async (req: Request, res: Response) => {
  try {
    const instruments = await getInstruments();
    res.status(200).json(instruments);
  } catch (error: any) {
    console.error('Error in getInstrumentsController:', error);
    res.status(500).json({ message: 'Error fetching instruments' });
  }
};

export const getRequestByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error('Error in getRequestByIdController:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
};