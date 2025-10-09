import { Request, Response } from 'express';
import { createRequest, getCreatedRequests } from '../services/requestService';

export const createRequestController = async (req: Request, res: Response) => {
  try {
    const { leader_id, event_type_id, description, event_date, start_time, end_time, location, instrument_ids, ...optionalFields } = req.body;

    // Basic validation
    if (!leader_id || !event_type_id || !event_date || !start_time || !end_time || !location) {
      return res.status(400).json({ message: 'Missing required fields: leader_id, event_type_id, event_date, start_time, end_time, location' });
    }

    const newRequest = await createRequest({
      leader_id,
      event_type_id,
      description,
      event_date,
      start_time,
      end_time,
      location,
      instrument_ids,
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