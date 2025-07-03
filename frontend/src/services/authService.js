import httpClient from './api/httpClient';

const authService = {
    login: async (credentials) => {
        try {
            const response = await httpClient.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
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
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    },

    getRole: () => {
        return localStorage.getItem('role');
    },

    isAdmin: () => {
        return localStorage.getItem('role') === 'ADMIN';
    }
};

export default authService;