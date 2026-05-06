import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Remove accidental quotes and whitespace
const cleanedBaseURL = rawBaseURL.replace(/['"]+/g, '').trim();

const api = axios.create({
    baseURL: cleanedBaseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
