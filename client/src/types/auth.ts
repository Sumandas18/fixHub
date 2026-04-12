export type Role = 'admin' | 'provider' | 'user';

export interface User {
  id: string;
  name?: string;
  email: string;
  contact?: string;
  role: Role;
  // Extensible for other user fields returned by API
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginParams {
  email: string;
  password?: string; // Sometimes password might be omitted depending on specific flows
}
