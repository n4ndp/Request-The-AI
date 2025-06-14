import httpClient from './api/httpClient';

const authService = {
    login: async (credentials) => {
        try {
            const response = await httpClient.post('/auth/login', credentials);
            if (response.data.token) {
                sessionStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    register: async (userData) => {
        try {
            const response = await httpClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },

    logout: () => {
        sessionStorage.removeItem('token');
    }
};

export default authService;