export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  user: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
} 