import { Request, Response } from 'express';
import { createRequest, getCreatedRequests, getEventTypes, getRequestById } from '../services/requestService';

export const createRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    const allowedRoles = ['client', 'musician'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Only clients and musicians can create requests' });
    }

    const { title, description, category, instrument, event_date, start_time, end_time, location, is_public } = req.body;

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
      is_public,
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