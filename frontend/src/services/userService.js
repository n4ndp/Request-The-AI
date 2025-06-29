import httpClient from './api/httpClient';

const userService = {
    getCurrentUserProfile: async () => {
        try {
            const response = await httpClient.get('/users/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching user profile');
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await httpClient.put('/users/me', profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating user profile');
        }
    },

    getAllUserProfiles: async () => {
        try {
            const response = await httpClient.get('/users');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching all user profiles');
        }
    },

    deleteUser: async (username) => {
        try {
            const response = await httpClient.delete(`/users/delete/${username}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting user');
        }
    }
};

export default userService;