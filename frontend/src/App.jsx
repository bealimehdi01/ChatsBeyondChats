import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import About from './components/About';
import AdminPanel from './components/AdminPanel';

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleNavigateHome = () => {
    setSelectedArticle(null);
    setCurrentView('dashboard');
  };

  const handleNavigateAbout = () => {
    setSelectedArticle(null);
    setCurrentView('about');
  };

  const handleNavigateAdmin = () => {
    setSelectedArticle(null);
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigateAbout={handleNavigateAbout}
        onNavigateAdmin={handleNavigateAdmin}
        currentView={currentView}
      />

      {currentView === 'about' ? (
        <About />
      ) : currentView === 'admin' ? (
        <AdminPanel />
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
