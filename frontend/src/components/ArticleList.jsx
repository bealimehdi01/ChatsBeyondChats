import React, { useEffect, useState } from 'react';
import { getArticles } from '../services/api';

const ArticleList = ({ onSelectArticle }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await getArticles();
            // Group by original ID to show pairings if needed, or just list all
            // For simplicity, just listing all for now
            setArticles(data);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-400">Loading articles...</div>;

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Articles</h1>
                    <p className="text-gray-500">Latest updates from BeyondChats and AI enhancements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => onSelectArticle(article)}
                        className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 group"
                    >
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${article.source === 'enhanced' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {article.source === 'enhanced' ? 'AI Enhanced' : 'Original'}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-black leading-tight">
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
                ))}
            </div>
        </div>
    );
};

export default ArticleList;
