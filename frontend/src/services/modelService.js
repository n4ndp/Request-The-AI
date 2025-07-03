import httpClient from './api/httpClient';

const modelService = {
    getModels: async () => {
        try {
            const response = await httpClient.get('/models');
            return response.data;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch models');
        }
    },

    getModelById: async (id) => {
        try {
            const response = await httpClient.get(`/models/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching model:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch model');
        }
    },

    createModel: async (modelData) => {
        try {
            const response = await httpClient.post('/models', modelData);
            return response.data;
        } catch (error) {
            console.error('Error creating model:', error);
            throw new Error(error.response?.data?.message || 'Failed to create model');
        }
    },

    updateModel: async (id, modelData) => {
        try {
            const response = await httpClient.put(`/models/${id}`, modelData);
            return response.data;
        } catch (error) {
            console.error('Error updating model:', error);
            throw new Error(error.response?.data?.message || 'Failed to update model');
        }
    },

    deleteModel: async (id) => {
        try {
            await httpClient.delete(`/models/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting model:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete model');
        }
    }
};

export default modelService;
