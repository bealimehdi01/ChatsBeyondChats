import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import About from './components/About';

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'about'

  const handleNavigateHome = () => {
    setSelectedArticle(null);
    setCurrentView('dashboard');
  };

  const handleNavigateAbout = () => {
    setSelectedArticle(null);
    setCurrentView('about');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigateAbout={handleNavigateAbout}
        currentView={currentView}
      />

      {currentView === 'about' ? (
        <About />
      ) : selectedArticle ? (
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
