import httpClient from './api/httpClient';

const chatService = {
    // Obtener todas las conversaciones del usuario
    getUserConversations: async () => {
        try {
            const response = await httpClient.get('/chat/conversations');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching conversations');
        }
    },

    // Obtener detalles de una conversación específica con sus mensajes
    getConversationDetail: async (conversationId) => {
        try {
            const response = await httpClient.get(`/chat/conversations/${conversationId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching conversation detail');
        }
    },

    // Crear una nueva conversación
    createConversation: async (title) => {
        try {
            const response = await httpClient.post('/chat/conversation', { title });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error creating conversation');
        }
    },

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
    },

    sendMessageStream: (messageData, onChunk, onError, onComplete) => {
        console.log('🚀 Starting stream with data:', messageData);
        
        // Get the base URL for the API
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? '/api/chat/message/stream' 
            : 'http://localhost:8080/api/chat/message/stream';

        console.log('🌐 Using base URL:', baseUrl);

        // Get the auth token
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('❌ No authentication token found');
            onError && onError(new Error('No authentication token found'));
            return;
        }

        console.log('🔑 Token found, length:', token.length);
        
        return fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(messageData)
        }).then(response => {
            console.log('📡 Response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                console.error('❌ Response not OK:', response.status, response.statusText);
                if (response.status === 402) {
                    throw new Error('Insufficient credits');
                } else if (response.status === 401) {
                    throw new Error('Unauthorized - please login again');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('✅ Response OK, starting to read stream...');
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let chunkCount = 0;

            function processText({ done, value }) {
                if (done) {
                    console.log('🏁 Stream completed, total chunks:', chunkCount);
                    onComplete && onComplete();
                    return;
                }

                chunkCount++;
                const chunk = decoder.decode(value, { stream: true });
                console.log(`📦 Chunk ${chunkCount} received:`, {
                    rawChunk: chunk,
                    length: chunk.length
                });

                const lines = chunk.split('\n');
                console.log('📝 Lines in chunk:', lines);

                for (const line of lines) {
                    if (line.trim() === '') {
                        console.log('⏭️ Skipping empty line');
                        continue;
                    }
                    
                    console.log('🔍 Processing line:', line);
                    
                    if (line.startsWith('data:')) {
                        const dataStr = line.substring(5).trim();
                        console.log('📊 Data extracted:', dataStr);
                        
                        if (dataStr === '[DONE]') {
                            console.log('🏁 [DONE] signal received');
                            onComplete && onComplete();
                            return;
                        }
                        
                        try {
                            const data = JSON.parse(dataStr);
                            console.log('✅ Parsed data successfully:', data);
                            onChunk && onChunk(data);
                        } catch (e) {
                            console.warn('⚠️ Could not parse SSE data:', dataStr, 'Error:', e);
                        }
                    } else {
                        console.log('ℹ️ Line does not start with "data:":', line);
                    }
                }

                return reader.read().then(processText);
            }

            return reader.read().then(processText);
        }).catch(error => {
            console.error('💥 Streaming error:', error);
            onError && onError(error);
        });
    },

    deleteConversation: async (conversationId) => {
        try {
            await httpClient.delete(`/chat/conversations/${conversationId}`);
            return true;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar la conversación');
        }
    }
};

export default chatService;