import axios from 'axios';

const httpClient = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

httpClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/auth/')) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default httpClient;