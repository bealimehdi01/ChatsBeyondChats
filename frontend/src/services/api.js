import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export const getArticles = async () => {
    try {
        const response = await api.get('/articles');
        return response.data;
    } catch (error) {
        console.error("API Error - getArticles:", error);
        // Return dummy data for frontend demo if backend is offline
        return [
            {
                id: 1,
                title: "The Future of AI Chatbots",
                content: "Chatbots are evolving rapidly...",
                source: "original",
                created_at: "2023-10-27"
            },
            {
                id: 2,
                title: "The Future of AI Chatbots (Enhanced)",
                content: "Chatbots are evolving rapidly. According to recent studies...",
                source: "enhanced",
                original_article_id: 1,
                created_at: "2023-10-28"
            }
        ];
    }
};

export const getArticle = async (id) => {
    try {
        const response = await api.get(`/articles/${id}`);
        return response.data;
    } catch (error) {
        console.error("API Error - getArticle:", error);
        // Mock
        return {
            id: 1,
            title: "The Future of AI Chatbots",
            content: "Full content here...",
            source: "original",
            created_at: "2023-10-27"
        };
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

export default api;
