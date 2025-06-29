import httpClient from './api/httpClient';

const rechargeService = {
    rechargeBalance: async (amount) => {
        try {
            const response = await httpClient.post('/recharge', { amount });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error recharging balance');
        }
    },

    getRechargeHistory: async () => {
        try {
            const response = await httpClient.get('/recharge/history');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching recharge history');
        }
    }
};

export default rechargeService;