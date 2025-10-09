import { Request, Response } from 'express';
import { createRequest, getCreatedRequests } from '../services/requestService';

export const createRequestController = async (req: Request, res: Response) => {
  try {
    const { client_id, title, description, category, instrument, event_date, start_time, end_time, location, price } = req.body;

    const newRequest = await createRequest({
      client_id,
      title,
      description,
      category,
      instrument,
      event_date,
      start_time,
      end_time,
      location,
      total_price: price,
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