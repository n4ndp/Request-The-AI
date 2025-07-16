import httpClient from './api/httpClient';

const usageService = {
    // Obtener todos los usages para administrador
    getAllUsagesForAdmin: async () => {
        try {
            const response = await httpClient.get('/usages/admin');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching usage data for admin');
        }
    },

    // Obtener usages del usuario actual
    getMyUsages: async () => {
        try {
            const response = await httpClient.get('/usages/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching user usage data');
        }
    },

    // Obtener total de usages (solo admin)
    getTotalUsagesCount: async () => {
        try {
            const response = await httpClient.get('/usages/admin/count');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching total usage count');
        }
    }
};

export default usageService; 