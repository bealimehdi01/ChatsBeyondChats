import React from 'react';

const ArticleDetail = ({ article, onBack }) => {
    return (
        <div className="container mx-auto px-4 py-8 mt-16 animate-fade-in-up">
            <button
                onClick={onBack}
                className="mb-6 text-gray-500 hover:text-black flex items-center gap-2 transition-colors"
            >
                ← Back to List
            </button>

            <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${article.source === 'enhanced' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {article.source === 'enhanced' ? '✨ AI Enhanced Version' : '📄 Original Version'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-4 text-gray-900 leading-tight">
                        {article.title}
                    </h1>
                    <p className="text-gray-400">Published on {new Date(article.created_at || Date.now()).toLocaleDateString()}</p>
                </div>

                <div className="prose prose-lg mx-auto text-gray-600">
                    {article.content.split('\n').map((para, idx) => (
                        <p key={idx} className="mb-4 leading-relaxed">
                            {para}
                        </p>
                    ))}
                </div>

                {article.source === 'enhanced' && article.reference_links && (
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">References</h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500">
                            {/* Assuming reference_links is a JSON string or array, handling both */}
                            {(() => {
                                try {
                                    const links = typeof article.reference_links === 'string' ? JSON.parse(article.reference_links) : article.reference_links;
                                    return links.map((link, i) => (
                                        <li key={i}>
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                                                {link}
                                            </a>
                                        </li>
                                    ));
                                } catch (e) {
                                    return <li>No valid references found.</li>;
                                }
                            })()}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleDetail;
