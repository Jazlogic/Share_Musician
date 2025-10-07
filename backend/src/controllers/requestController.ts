import { Request, Response } from 'express';
import { createRequest, getCreatedRequests } from '../services/requestService';

export const createRequestController = async (req: Request, res: Response) => {
  try {
    const { client_id, title, description, event_date, start_time, end_time, instrument, ...optionalFields } = req.body;

    // Basic validation
    if (!client_id || !title || !description || !event_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newRequest = await createRequest({
      client_id,
      title,
      description,
      event_date,
      start_time,
      end_time,
      instrument,
      ...optionalFields,
    });

    res.status(201).json({ message: 'Music request created successfully', request: newRequest });
  } catch (error) {
    console.error('Error in createRequestController:', error);
    res.status(500).json({ message: 'Internal server error' });
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