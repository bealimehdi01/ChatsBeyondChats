import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// ========== ARTICLES ==========

export const getArticles = async () => {
    try {
        const response = await api.get('/articles');
        return response.data;
    } catch (error) {
        console.error("API Error - getArticles:", error);
        return [];
    }
};

export const getArticle = async (id) => {
    try {
        const response = await api.get(`/articles/${id}`);
        return response.data;
    } catch (error) {
        console.error("API Error - getArticle:", error);
        throw error;
    }
};

export const deleteArticle = async (id) => {
    try {
        const response = await api.delete(`/articles/${id}`);
        return response.data;
    } catch (error) {
        console.error("API Error - deleteArticle:", error);
        throw error;
    }
};

// ========== ADMIN SETTINGS ==========

export const getSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.error("API Error - getSettings:", error);
        return {
            mode: 'manual',
            interval_minutes: 5,
            source_url: 'https://beyondchats.com/blogs/'
        };
    }
};

export const updateSettings = async (settings) => {
    try {
        const response = await api.put('/settings', settings);
        return response.data;
    } catch (error) {
        console.error("API Error - updateSettings:", error);
        throw error;
    }
};

// ========== SCRAPING & ENHANCEMENT ==========

export const triggerScrape = async (sourceUrl) => {
    try {
        const response = await api.post('/scrape', { source_url: sourceUrl });
        return response.data;
    } catch (error) {
        console.error("API Error - triggerScrape:", error);
        throw error;
    }
};

export const triggerEnhance = async (articleId) => {
    try {
        const response = await api.post(`/enhance/${articleId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - triggerEnhance:", error);
        throw error;
    }
};

export default api;
