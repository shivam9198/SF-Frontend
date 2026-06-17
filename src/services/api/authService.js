import api from './axios';

export const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data?.user || response.data;
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // Fallback to local storage if API fails
            return authService.getCurrentUser();
        }
    },

    logout: () => {
        // Handled by AuthContext clearing localStorage
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
