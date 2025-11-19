import api from './api';
import { RegisterData } from '../types';

const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/token', { email, password });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    // Exclude confirmPassword from the request - it's only for frontend validation
    const { confirmPassword, ...registerPayload } = userData;
    const response = await api.post('/register', registerPayload);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/refresh');
    return response.data;
  },
};

export default authService;