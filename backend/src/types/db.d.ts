export interface Church {
  churches_id: string;
  name: string;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
  active_role: 'leader' | 'musician';
  status: 'active' | 'pending' | 'rejected';
  church_id: string | null;
  created_at: Date;
  updated_at: Date;
  email_verified?: boolean;
  verification_token?: string | null;
}

export interface UserPassword {
  password_id: string;
  user_id: string;
  password: string;
  created_at: Date;
}

export interface EmailVerification {
  verification_id: string;
  user_id: string;
  email: string;
  pin: string;
  created_at: Date;
  expires_at: Date;
  verified: boolean;
}

export interface Request {
  id: string;
  client_id: string;
  musician_id: string | null;
  title: string;
  description: string;
  category: string;
  location: {
    address?: string;
    lat?: number;
    lng?: number;
    distance_km?: number;
  } | null;
  event_date: Date;
  start_time: string;
  end_time: string;
  event_duration: string;
  price: number;
  tip: number | null;
  status: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
  updated_by: string | null;
  expiration_date: Date | null;
  cancellation_reason: string | null;
  client_rating: number | null;
  musician_rating: number | null;
  client_comment: string | null;
  musician_comment: string | null;
}