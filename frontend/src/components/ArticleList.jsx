import React, { useEffect, useState } from 'react';
import { getArticles, deleteArticle } from '../services/api';

const ArticleList = ({ onSelectArticle }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'original', 'enhanced'
    const [refreshing, setRefreshing] = useState(false);

    const fetchArticles = async () => {
        setRefreshing(true);
        try {
            const data = await getArticles();
            setArticles(data);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm('Delete this article?')) return;

        try {
            await deleteArticle(id);
            setArticles(articles.filter(article => article.id !== id));
        } catch (error) {
            alert('Failed to delete article');
        }
    };

    const filteredArticles = articles.filter(article => {
        if (filter === 'all') return true;
        return article.source === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading articles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Articles</h1>
                    <p className="text-gray-500">Latest updates from BeyondChats and AI enhancements.</p>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={fetchArticles}
                    disabled={refreshing}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['all', 'original', 'enhanced'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-3 font-medium transition-all ${filter === tab
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'all' ? 'All Articles' : tab === 'original' ? '📄 Original' : '✨ AI Enhanced'}
                        <span className="ml-2 text-xs text-gray-400">
                            ({articles.filter(a => tab === 'all' || a.source === tab).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No {filter !== 'all' ? filter : ''} articles found.
                    </div>
                ) : (
                    filteredArticles.map((article) => (
                        <div
                            key={article.id}
                            className="glass-card p-6 hover:shadow-2xl transition-all duration-300 group relative"
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(article.id, e)}
                                className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                                title="Delete article"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            <div
                                onClick={() => onSelectArticle(article)}
                                className="cursor-pointer"
                            >
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${article.source === 'enhanced' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {article.source === 'enhanced' ? '✨ AI Enhanced' : '📄 Original'}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-black leading-tight pr-8">
                                    {article.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                                    {article.content}
                                </p>
                                <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                                    <span>{new Date(article.created_at || Date.now()).toLocaleDateString()}</span>
                                    <span className="font-medium group-hover:translate-x-1 transition-transform">Read more →</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ArticleList;
