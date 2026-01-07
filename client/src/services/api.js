import axios from 'axios';
import { store } from '../store';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the token and workspace ID
api.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = localStorage.getItem('token');
        const workspaceId = state.workspaces?.currentWorkspace?._id;

        if (token) {
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
