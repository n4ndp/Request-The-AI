import httpClient from './api/httpClient';

const chatService = {
    sendMessage: async (messageData) => {
        try {
            const response = await httpClient.post('/chat/message', messageData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 402) {
                throw new Error('Insufficient credits');
            }
            throw new Error(error.response?.data?.message || 'Error sending message');
        }
    }
};

export default chatService;