// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Store active cancel tokens
const activeRequests = new Map();

// Generate a unique key for each request
const generateRequestKey = (config) => {
    return `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
};

// Request interceptor: always attach token from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            // Don't overwrite if already set
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Add cancel token to the request
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;

        // Store the cancel token
        const requestKey = generateRequestKey(config);
        activeRequests.set(requestKey, source);

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: return full axios response object
api.interceptors.response.use(
    (response) => {
        // Remove the request from active requests on completion
        const requestKey = generateRequestKey(response.config);
        activeRequests.delete(requestKey);
        return response; // return full response
    },
    (error) => {
        // Remove the request from active requests on error
        if (error.config) {
            const requestKey = generateRequestKey(error.config);
            activeRequests.delete(requestKey);
        }

        // centralized auth error handling
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            // Only handle auth errors if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                delete api.defaults.headers.Authorization;

                // Cancel all pending requests
                cancelAllRequests('User logged out');

                // Send user to login screen
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Function to cancel all pending requests
export const cancelAllRequests = (message = 'Request canceled') => {
    activeRequests.forEach((source, key) => {
        source.cancel(message);
        activeRequests.delete(key);
    });
};

// Function to create a cancel token for specific requests
export const createCancelToken = () => {
    return axios.CancelToken.source();
};

// Function to cancel a specific request by key
export const cancelRequest = (key) => {
    if (activeRequests.has(key)) {
        activeRequests.get(key).cancel('Request canceled by user');
        activeRequests.delete(key);
    }
};

// Function to get active requests count (for debugging)
export const getActiveRequestsCount = () => {
    return activeRequests.size;
};

export default api;