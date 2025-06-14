import axios from 'axios';

const httpClient = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

httpClient.interceptors.request.use(config => {
    if (!config.url.includes('/auth/')) {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

export default httpClient;