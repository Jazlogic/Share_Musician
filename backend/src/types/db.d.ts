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