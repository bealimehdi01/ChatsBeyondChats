import React from 'react';

const Navbar = ({ onNavigateHome }) => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-8">
            {/* Logo - clickable */}
            <button onClick={onNavigateHome} className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    B
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">BeyondChats</span>
            </button>

            {/* Navigation Buttons */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                <button
                    onClick={onNavigateHome}
                    className="text-gray-900 hover:text-purple-600 transition font-semibold"
                >
                    Dashboard
                </button>
                <button
                    onClick={onNavigateHome}
                    className="hover:text-purple-600 transition"
                >
                    Articles
                </button>
            </div>

            <div className="w-10"></div> {/* Spacer for layout balance */}
        </nav>
    );
};

export default Navbar;
