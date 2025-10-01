declare namespace DB {
  interface Church {
    churches_id: string;
    name: string;
    location: string | null;
    created_at: Date;
    updated_at: Date;
  }

  interface User {
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
  }

  interface UserPassword {
    password_id: string;
    user_id: string;
    password: string;
    created_at: Date;
  }
}