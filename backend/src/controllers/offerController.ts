import { Request, Response } from 'express';
import { createOffer, getOfferById, acceptOffer, rejectOffer, getOffersByRequest } from '../services/offerService';

export const createOfferController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    // Solo músicos pueden crear ofertas
    if (req.user.role !== 'musician') {
      return res.status(403).json({ message: 'Forbidden: Only musicians can create offers' });
    }

    const { request_id, price, message } = req.body;

    // Validación básica de campos requeridos
    if (!request_id || !price || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields: request_id, price, and message are required' 
      });
    }

    // Validar que el precio sea un número positivo
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ 
        message: 'Price must be a positive number' 
      });
    }

    const offerData = {
      request_id,
      musician_id: req.user.userId,
      price: numericPrice,
      message: message.trim()
    };

    const result = await createOffer(offerData);
    
    return res.status(201).json({
      id: result.id,
      request_id: result.request_id,
      musician_id: result.musician_id,
      price: result.price,
      message: result.message,
      status: result.status,
      created_at: result.created_at
    });

  } catch (error: any) {
    console.error('Error creating offer:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        message: 'You have already made an offer for this request' 
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        message: 'Request not found or no longer available for offers' 
      });
    }

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: 'You are not authorized to make offers for this request' 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error while creating offer' 
    });
  }
};

export const getOfferByIdController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Offer ID is required' });
    }

    const offer = await getOfferById(id, req.user.userId, req.user.role);

    return res.status(200).json(offer);

  } catch (error: any) {
    console.error('Error getting offer:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ message: 'You are not authorized to view this offer' });
    }

    return res.status(500).json({ 
      message: 'Internal server error while getting offer' 
    });
  }
};

export const acceptOfferController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    // Solo clientes pueden aceptar ofertas
    if (req.user.role !== 'client' && req.user.role !== 'leader') {
      return res.status(403).json({ 
        message: 'Forbidden: Only clients and leaders can accept offers' 
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Offer ID is required' });
    }

    const result = await acceptOffer(id, req.user.userId);

    return res.status(200).json({
      message: 'Offer accepted successfully',
      offer: {
        id: result.id,
        status: result.status
      }
    });

  } catch (error: any) {
    console.error('Error accepting offer:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: 'You are not authorized to accept this offer' 
      });
    }

    if (error.message.includes('cannot be accepted')) {
      return res.status(400).json({ 
        message: 'This offer cannot be accepted in its current status' 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error while accepting offer' 
    });
  }
};

export const rejectOfferController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    // Solo clientes pueden rechazar ofertas
    if (req.user.role !== 'client' && req.user.role !== 'leader') {
      return res.status(403).json({ 
        message: 'Forbidden: Only clients and leaders can reject offers' 
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Offer ID is required' });
    }

    const result = await rejectOffer(id, req.user.userId);

    return res.status(200).json({
      message: 'Offer rejected successfully',
      offer: {
        id: result.id,
        status: result.status
      }
    });

  } catch (error: any) {
    console.error('Error rejecting offer:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: 'You are not authorized to reject this offer' 
      });
    }

    if (error.message.includes('cannot be rejected')) {
      return res.status(400).json({ 
        message: 'This offer cannot be rejected in its current status' 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error while rejecting offer' 
    });
  }
};

export const getOffersByRequestController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User information not found' });
    }

    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    const offers = await getOffersByRequest(requestId, req.user.userId, req.user.role);

    return res.status(200).json(offers);

  } catch (error: any) {
    console.error('Error getting offers by request:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (error.message.includes('not authorized')) {
      return res.status(403).json({ 
        message: 'You are not authorized to view offers for this request' 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error while getting offers' 
    });
  }
};
