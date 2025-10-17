import pool from '../config/db';

export interface OfferData {
  request_id: string;
  musician_id: string;
  price: number;
  message: string;
}

export interface Offer {
  id: string;
  request_id: string;
  musician_id: string;
  musician_name?: string;
  price: number;
  message: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const createOffer = async (offerData: OfferData): Promise<Offer> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la solicitud existe y está en estado CREATED
    const requestQuery = `
      SELECT id, client_id, status 
      FROM request 
      WHERE id = $1 AND status = 'CREATED'
    `;
    const requestResult = await client.query(requestQuery, [offerData.request_id]);
    
    if (requestResult.rows.length === 0) {
      throw new Error('Request not found or no longer available for offers');
    }

    const request = requestResult.rows[0];

    // Verificar que el músico no sea el mismo cliente que creó la solicitud
    if (request.client_id === offerData.musician_id) {
      throw new Error('You cannot make an offer for your own request');
    }

    // Verificar que el músico no haya hecho ya una oferta para esta solicitud
    const existingOfferQuery = `
      SELECT id FROM offer 
      WHERE request_id = $1 AND musician_id = $2
    `;
    const existingOfferResult = await client.query(existingOfferQuery, [
      offerData.request_id, 
      offerData.musician_id
    ]);

    if (existingOfferResult.rows.length > 0) {
      throw new Error('You have already made an offer for this request');
    }

    // Crear la oferta
    const insertOfferQuery = `
      INSERT INTO offer (request_id, musician_id, price, message, status)
      VALUES ($1, $2, $3, $4, 'SENT')
      RETURNING id, request_id, musician_id, price, message, status, created_at, updated_at
    `;
    
    const offerResult = await client.query(insertOfferQuery, [
      offerData.request_id,
      offerData.musician_id,
      offerData.price,
      offerData.message
    ]);

    await client.query('COMMIT');

    return offerResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOfferById = async (offerId: string, userId: string, userRole: string): Promise<Offer> => {
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT 
        o.id,
        o.request_id,
        o.musician_id,
        u.name as musician_name,
        o.price,
        o.message,
        o.status,
        o.created_at,
        o.updated_at
      FROM offer o
      JOIN users u ON o.musician_id = u.user_id
      WHERE o.id = $1
    `;

    let params: any[] = [offerId];

    // Aplicar restricciones de acceso basadas en el rol
    if (userRole === 'musician') {
      // Los músicos solo pueden ver sus propias ofertas
      query += ` AND o.musician_id = $2`;
      params.push(userId);
    } else if (userRole === 'client' || userRole === 'leader') {
      // Los clientes solo pueden ver ofertas de sus solicitudes
      query += ` AND o.request_id IN (
        SELECT id FROM request WHERE client_id = $2
      )`;
      params.push(userId);
    } else if (userRole !== 'admin') {
      // Solo admins pueden ver todas las ofertas sin restricciones
      throw new Error('Not authorized to view this offer');
    }

    const result = await client.query(query, params);

    if (result.rows.length === 0) {
      throw new Error('Offer not found');
    }

    return result.rows[0];

  } finally {
    client.release();
  }
};

export const acceptOffer = async (offerId: string, userId: string): Promise<Offer> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la oferta existe y obtener información de la solicitud
    const offerQuery = `
      SELECT 
        o.id,
        o.request_id,
        o.musician_id,
        o.status,
        r.client_id,
        r.status as request_status
      FROM offer o
      JOIN request r ON o.request_id = r.id
      WHERE o.id = $1
    `;
    
    const offerResult = await client.query(offerQuery, [offerId]);
    
    if (offerResult.rows.length === 0) {
      throw new Error('Offer not found');
    }

    const offer = offerResult.rows[0];

    // Verificar que el usuario es el cliente de la solicitud
    if (offer.client_id !== userId) {
      throw new Error('You are not authorized to accept this offer');
    }

    // Verificar que la oferta está en estado SENT
    if (offer.status !== 'SENT') {
      throw new Error('This offer cannot be accepted in its current status');
    }

    // Verificar que la solicitud está en estado CREATED
    if (offer.request_status !== 'CREATED') {
      throw new Error('The request is no longer available for accepting offers');
    }

    // Actualizar la oferta a ACCEPTED
    const updateOfferQuery = `
      UPDATE offer 
      SET status = 'ACCEPTED', updated_at = NOW()
      WHERE id = $1
      RETURNING id, request_id, musician_id, price, message, status, created_at, updated_at
    `;
    
    const updatedOfferResult = await client.query(updateOfferQuery, [offerId]);

    // Actualizar la solicitud a ACCEPTED y asignar el músico
    const updateRequestQuery = `
      UPDATE request 
      SET status = 'ACCEPTED', musician_id = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await client.query(updateRequestQuery, [offer.musician_id, offer.request_id]);

    // Rechazar todas las otras ofertas para esta solicitud
    const rejectOtherOffersQuery = `
      UPDATE offer 
      SET status = 'REJECTED', updated_at = NOW()
      WHERE request_id = $1 AND id != $2 AND status = 'SENT'
    `;
    
    await client.query(rejectOtherOffersQuery, [offer.request_id, offerId]);

    await client.query('COMMIT');

    return updatedOfferResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const rejectOffer = async (offerId: string, userId: string): Promise<Offer> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que la oferta existe y obtener información de la solicitud
    const offerQuery = `
      SELECT 
        o.id,
        o.request_id,
        o.status,
        r.client_id,
        r.status as request_status
      FROM offer o
      JOIN request r ON o.request_id = r.id
      WHERE o.id = $1
    `;
    
    const offerResult = await client.query(offerQuery, [offerId]);
    
    if (offerResult.rows.length === 0) {
      throw new Error('Offer not found');
    }

    const offer = offerResult.rows[0];

    // Verificar que el usuario es el cliente de la solicitud
    if (offer.client_id !== userId) {
      throw new Error('You are not authorized to reject this offer');
    }

    // Verificar que la oferta está en estado SENT
    if (offer.status !== 'SENT') {
      throw new Error('This offer cannot be rejected in its current status');
    }

    // Verificar que la solicitud está en estado CREATED
    if (offer.request_status !== 'CREATED') {
      throw new Error('The request is no longer available for rejecting offers');
    }

    // Actualizar la oferta a REJECTED
    const updateOfferQuery = `
      UPDATE offer 
      SET status = 'REJECTED', updated_at = NOW()
      WHERE id = $1
      RETURNING id, request_id, musician_id, price, message, status, created_at, updated_at
    `;
    
    const updatedOfferResult = await client.query(updateOfferQuery, [offerId]);

    await client.query('COMMIT');

    return updatedOfferResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOffersByRequest = async (requestId: string, userId: string, userRole: string): Promise<Offer[]> => {
  const client = await pool.connect();
  
  try {
    let query = `
      SELECT 
        o.id,
        o.request_id,
        o.musician_id,
        u.name as musician_name,
        o.price,
        o.message,
        o.status,
        o.created_at,
        o.updated_at
      FROM offer o
      JOIN users u ON o.musician_id = u.user_id
      WHERE o.request_id = $1
    `;

    let params: any[] = [requestId];

    // Aplicar restricciones de acceso basadas en el rol
    if (userRole === 'musician') {
      // Los músicos solo pueden ver sus propias ofertas para esta solicitud
      query += ` AND o.musician_id = $2`;
      params.push(userId);
    } else if (userRole === 'client' || userRole === 'leader') {
      // Los clientes solo pueden ver ofertas de sus propias solicitudes
      query += ` AND o.request_id IN (
        SELECT id FROM request WHERE client_id = $2
      )`;
      params.push(userId);
    } else if (userRole !== 'admin') {
      // Solo admins pueden ver todas las ofertas sin restricciones
      throw new Error('Not authorized to view offers for this request');
    }

    // Verificar que la solicitud existe
    const requestQuery = `
      SELECT id, client_id FROM request WHERE id = $1
    `;
    const requestResult = await client.query(requestQuery, [requestId]);
    
    if (requestResult.rows.length === 0) {
      throw new Error('Request not found');
    }

    const request = requestResult.rows[0];

    // Verificar autorización adicional para clientes
    if (userRole === 'client' || userRole === 'leader') {
      if (request.client_id !== userId) {
        throw new Error('You are not authorized to view offers for this request');
      }
    }

    const result = await client.query(query, params);

    return result.rows;

  } finally {
    client.release();
  }
};
