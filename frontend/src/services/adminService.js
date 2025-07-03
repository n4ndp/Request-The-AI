import httpClient from './api/httpClient';

const adminService = {
    // Obtener todos los usuarios
    getAllUsers: async () => {
        try {
            const response = await httpClient.get('/users');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
        }
    },

    // Crear un nuevo usuario
    createUser: async (userData) => {
        try {
            const response = await httpClient.post('/users', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al crear usuario');
        }
    },

    // Actualizar un usuario existente
    updateUser: async (username, userData) => {
        try {
            const response = await httpClient.put(`/users/${username}`, userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
        }
    },

    // Eliminar un usuario
    deleteUser: async (username) => {
        try {
            const response = await httpClient.delete(`/users/delete/${username}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
        }
    }
};

export default adminService; 