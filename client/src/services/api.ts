import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('Targeting API:', API_URL);

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem('token');
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export const projectService = {
    getProjects: () => api.get('/projects'),
    getProject: (id: string) => api.get(`/projects/${id}`),
    createProject: (data: any) => api.post('/projects', data),
    joinProject: (token: string) => api.post('/projects/join', { token }),
    updateProject: (id: string, data: any) => api.put(`/projects/${id}`, data),
    deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const taskService = {
    getTasks: (projectId: string) => api.get(`/tasks/${projectId}`),
    createTask: (data: any) => api.post('/tasks', data),
    updateTaskStatus: (id: string, status: string) => api.patch(`/tasks/${id}/status`, { status }),
    updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
    deleteTask: (id: string) => api.delete(`/tasks/${id}`),
};

export const userService = {
    getProfile: () => api.get('/users/me'),
    getStats: () => api.get('/users/stats'),
    updateProfile: (data: { name?: string; email?: string; avatar?: string }) => api.patch('/users/me', data),
};

export default api;
