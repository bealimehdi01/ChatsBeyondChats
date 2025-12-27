import React from 'react';

const About = () => {
    return (
        <div className="container mx-auto px-4 py-12 mt-16 max-w-4xl">
            <div className="glass-card p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">About This App</h1>

                <div className="prose prose-lg text-gray-600">
                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">💡 What Does This App Do?</h2>
                    <p className="mb-4">
                        Think of this as an <strong>"Automatic Blog Improver"</strong> - it takes old, outdated articles and uses AI to rewrite them to match the quality of top-ranking Google results.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">🎨 The Interface</h3>
                    <p className="mb-4">
                        A <strong>React dashboard</strong> that displays articles with a <strong>side-by-side comparison</strong>:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>📄 Original:</strong> The article exactly as it appeared on BeyondChats blog</li>
                        <li><strong>✨ Enhanced:</strong> The new AI-rewritten version with better formatting and updated information</li>
                        <li><strong>📱 Responsive:</strong> Works seamlessly on mobile and desktop</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">⚙️ How It Works</h3>
                    <p className="mb-4">The app performs a <strong>four-step automated cycle</strong>:</p>

                    <div className="space-y-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-900 mb-2">1. 📚 Finds Old Content</h4>
                            <p className="text-blue-800">Scrapes the 5 oldest blog posts from BeyondChats website</p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-bold text-purple-900 mb-2">2. 🔍 Researches Competitors</h4>
                            <p className="text-purple-800">Takes each article title → Searches Google → Finds top 2 results from competitors → Analyzes what makes them rank</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-bold text-green-900 mb-2">3. 🤖 Rewrites Using AI</h4>
                            <p className="text-green-800">Sends original article + competitor insights to Google Gemini or Perplexity → AI rewrites to match quality and formatting of top results</p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-bold text-orange-900 mb-2">4. 📝 Publishes</h4>
                            <p className="text-orange-800">Saves enhanced version to database → Adds competitor links as references</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg mt-8">
                        <p className="text-lg font-semibold text-gray-800 mb-2">🎯 Result</p>
                        <p className="text-gray-700">
                            Old content automatically transformed into ranking-quality content, displayed on a professional web interface with full CRUD operations.
                        </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3">🛠️ Tech Stack</h3>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li><strong>Backend:</strong> Laravel 11 (PHP 8.2) with SQLite</li>
                        <li><strong>Worker:</strong> Node.js with Puppeteer for web scraping</li>
                        <li><strong>Frontend:</strong> React + Vite + Tailwind CSS</li>
                        <li><strong>AI:</strong> Google Gemini & Perplexity API (dual-provider fallback)</li>
                        <li><strong>Deployment:</strong> Replit (backend/worker) + Vercel (frontend)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default About;
