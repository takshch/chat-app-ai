import axios from 'axios';
import type { LoginData, SignupData, User, Chat, ChatListItem, Message } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Auth API calls
export const authAPI = {
  signup: async (data: SignupData): Promise<{ message: string; user: User }> => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  verifyToken: async (): Promise<{ message: string; user: any }> => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },
};

// Chat API calls
export const chatAPI = {
  createChat: async (message: string): Promise<{ chatId: string; title: string; message: string }> => {
    const response = await api.post('/api/chat/create', { message });
    return response.data;
  },

  sendMessage: async (chatId: string, message: string): Promise<{ chatId: string; message: string }> => {
    const response = await api.post('/api/chat/send', { chatId, message });
    return response.data;
  },

  getChatHistory: async (chatId: string): Promise<{ chat: Chat }> => {
    const response = await api.get(`/api/chat/history/${chatId}`);
    return response.data;
  },

  getChats: async (): Promise<{ chats: ChatListItem[] }> => {
    const response = await api.get('/api/chat/chats');
    return response.data;
  },
};

export default api;
