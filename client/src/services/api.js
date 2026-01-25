import axios from 'axios';
import { store } from '../store';

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    // Defensively ignore the old Railway URL if it's still stuck in environment variables
    if (envUrl && !envUrl.includes('railway.app')) {
        return envUrl;
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to attach the token and workspace ID
api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = localStorage.getItem('token');
        const workspaceId = state.workspaces?.currentWorkspace?._id;

        // List of public endpoints that don't need auth
        const publicEndpoints = [
            '/auth/login',
            '/auth/register',
            '/access-requests',
            '/landing/contact',
            '/landing/subscribe'
        ];

        // Check if current URL is public
        const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (token && !isPublic) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (workspaceId) {
            config.headers['X-Workspace-ID'] = workspaceId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
