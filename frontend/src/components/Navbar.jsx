import React from 'react';

const Navbar = ({ onNavigateHome, onNavigateAbout, onNavigateAdmin, currentView }) => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-8">
            {/* Logo */}
            <button onClick={onNavigateHome} className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    B
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">BeyondChats</span>
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                <button
                    onClick={onNavigateHome}
                    className={`transition ${currentView === 'dashboard' ? 'text-purple-600 font-semibold' : 'hover:text-purple-600'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={onNavigateAbout}
                    className={`transition ${currentView === 'about' ? 'text-purple-600 font-semibold' : 'hover:text-purple-600'}`}
                >
                    About
                </button>
                <button
                    onClick={onNavigateAdmin}
                    className={`transition ${currentView === 'admin' ? 'text-purple-600 font-semibold' : 'hover:text-purple-600'}`}
                >
                    ⚙️ Admin
                </button>
            </div>

            <div className="w-10"></div>
        </nav>
    );
};

export default Navbar;
