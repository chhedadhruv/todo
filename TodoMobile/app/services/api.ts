import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, User, AuthResponse } from '../types';
import { Platform } from 'react-native';

const API_URL = 'https://todo.dhruvchheda.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TodoMobile/1.0',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  console.log('Making request to:', config.url);
  console.log('Request method:', config.method);
  console.log('Request headers:', config.headers);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No access token found in AsyncStorage');
  }
  return config;
});

// Helper function to retry failed requests
const retryRequest = async (error: any, retryCount = 3) => {
  const originalRequest = error.config;
  
  if (!originalRequest._retryCount) {
    originalRequest._retryCount = 0;
  }
  
  if (originalRequest._retryCount >= retryCount) {
    return Promise.reject(error);
  }
  
  originalRequest._retryCount += 1;
  
  // Exponential backoff delay
  const delay = Math.pow(2, originalRequest._retryCount) * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return api(originalRequest);
};

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    const originalRequest = error.config;
    
    // Handle Cloudflare errors
    if (error.response?.status === 520) {
      return retryRequest(error);
    }
    
    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }
        
        const response = await api.post<AuthResponse>('/token/refresh/', {
          refresh: refreshToken
        });
        
        await AsyncStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        throw new Error('Session expired. Please login again.');
      }
    }
    
    if (error.response) {
      // Handle specific HTTP error codes
      switch (error.response.status) {
        case 401:
          console.warn('Authentication failed - clearing tokens');
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          break;
        case 403:
          error.message = 'You do not have permission to perform this action';
          break;
        case 404:
          error.message = 'The requested resource was not found';
          break;
        case 500:
          error.message = 'Server error occurred. Please try again later';
          break;
        case 520:
          error.message = 'Server connection error. Please try again later';
          break;
        default:
          if (error.response.data) {
            error.message = typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data);
          }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      error.message = 'Network error. Please check your internet connection';
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/login/', { username, password });
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || 'Login failed');
      }
      throw error;
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const response = await api.post<AuthResponse>('/token/refresh/', {
        refresh: refreshToken
      });
      
      await AsyncStorage.setItem('access_token', response.data.access);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || 'Token refresh failed');
      }
      throw error;
    }
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<User>('/register/', { username, email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || 'Registration failed');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
};

export const todoService = {
  getTodos: async (): Promise<Todo[]> => {
    try {
      const response = await api.get('/todos/');
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos. Please try again.');
    }
  },

  getTodo: async (id: number): Promise<Todo> => {
    try {
      const response = await api.get<Todo>(`/todos/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error in getTodo:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.message || 'Failed to fetch todo');
      }
      throw error;
    }
  },

  createTodo: async (todo: Omit<Todo, 'id' | 'created_at' | 'user'>): Promise<Todo> => {
    try {
      const response = await api.post('/todos/', todo);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo. Please try again.');
    }
  },

  updateTodo: async (id: number, todo: Partial<Todo>): Promise<Todo> => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await api.patch(`/todos/${id}/`, todo);
        return response.data;
      } catch (error: any) {
        console.error(`Error updating todo (attempt ${retryCount + 1}):`, error);
        
        if (error.response?.status === 520 && retryCount < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          retryCount++;
          continue;
        }
        
        throw new Error('Failed to update todo. Please try again.');
      }
    }
    throw new Error('Failed to update todo after multiple attempts.');
  },

  deleteTodo: async (id: number): Promise<void> => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await api.delete(`/todos/${id}/`);
        if (response.status === 204) {
          return;
        }
        throw new Error('Failed to delete todo');
      } catch (error: any) {
        console.error(`Error deleting todo (attempt ${retryCount + 1}):`, error);
        
        if (error.response?.status === 520 && retryCount < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          retryCount++;
          continue;
        }
        
        throw new Error('Failed to delete todo. Please try again.');
      }
    }
    throw new Error('Failed to delete todo after multiple attempts.');
  },

  toggleTodo: async (id: number): Promise<Todo> => {
    try {
      const response = await api.post(`/todos/${id}/toggle/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw new Error('Failed to toggle todo status. Please try again.');
    }
  },
}; 