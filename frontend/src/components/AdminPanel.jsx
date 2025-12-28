import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, triggerScrape, getArticles } from '../services/api';

const AdminPanel = () => {
    const [settings, setSettings] = useState({
        mode: 'manual',
        interval_minutes: 5,
        source_url: 'https://beyondchats.com/blogs/'
    });
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [enhanceLoading, setEnhanceLoading] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsData, articlesData] = await Promise.all([
                getSettings(),
                getArticles()
            ]);
            setSettings(settingsData);
            setArticles(articlesData.filter(a => a.source === 'original'));
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const handleSettingChange = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        try {
            await updateSettings(newSettings);
            showMessage('Settings saved!');
        } catch (error) {
            showMessage('Error saving settings');
        }
    };

    const handleScrape = async () => {
        setScrapeLoading(true);
        try {
            const result = await triggerScrape(settings.source_url);
            showMessage(result.message);
            await loadData(); // Refresh articles
        } catch (error) {
            showMessage('Error scraping articles');
        }
        setScrapeLoading(false);
    };

    const handleEnhance = async (articleId) => {
        setEnhanceLoading(articleId);
        try {
            // Note: This triggers enhancement on backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/enhance/${articleId}`, {
                method: 'POST'
            });
            const result = await response.json();
            showMessage(result.message || 'Enhancement queued!');
        } catch (error) {
            showMessage('Error triggering enhancement');
        }
        setEnhanceLoading(null);
    };

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 mt-16 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Admin Control Panel</h1>

            {message && (
                <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg animate-fade-in">
                    {message}
                </div>
            )}

            {/* Worker Mode Settings */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🤖 Worker Mode</h2>

                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => handleSettingChange('mode', 'manual')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${settings.mode === 'manual'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        📝 Manual
                    </button>
                    <button
                        onClick={() => handleSettingChange('mode', 'auto')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${settings.mode === 'auto'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🔄 Automatic
                    </button>
                </div>

                {settings.mode === 'auto' && (
                    <div className="flex items-center gap-3 mt-4">
                        <label className="text-gray-600">Interval:</label>
                        <select
                            value={settings.interval_minutes}
                            onChange={(e) => handleSettingChange('interval_minutes', parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Source URL & Scraping */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🌐 Fetch Original Articles</h2>

                <div className="mb-4">
                    <label className="block text-gray-600 mb-2">Source URL:</label>
                    <input
                        type="url"
                        value={settings.source_url}
                        onChange={(e) => setSettings({ ...settings, source_url: e.target.value })}
                        onBlur={() => handleSettingChange('source_url', settings.source_url)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://beyondchats.com/blogs/"
                    />
                </div>

                <button
                    onClick={handleScrape}
                    disabled={scrapeLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {scrapeLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span>📥</span>
                    )}
                    Fetch Original Articles
                </button>
            </div>

            {/* AI Enhancement */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">✨ AI Enhancement</h2>

                {articles.length === 0 ? (
                    <p className="text-gray-500">No original articles to enhance. Fetch some first!</p>
                ) : (
                    <div className="space-y-3">
                        {articles.map((article) => (
                            <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-800">{article.title}</h3>
                                    <p className="text-sm text-gray-500">ID: {article.id}</p>
                                </div>
                                <button
                                    onClick={() => handleEnhance(article.id)}
                                    disabled={enhanceLoading === article.id}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {enhanceLoading === article.id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>✨</span>
                                    )}
                                    AI Enhance
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
