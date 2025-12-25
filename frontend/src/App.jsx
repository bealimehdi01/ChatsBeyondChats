import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar onNavigateHome={() => setSelectedArticle(null)} />

      {selectedArticle ? (
        <ArticleDetail
          article={selectedArticle}
          onBack={() => setSelectedArticle(null)}
        />
      ) : (
        <ArticleList
          onSelectArticle={(article) => setSelectedArticle(article)}
        />
      )}
    </div>
  );
}

export default App;
