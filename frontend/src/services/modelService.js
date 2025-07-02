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
    }
};

export default modelService;
