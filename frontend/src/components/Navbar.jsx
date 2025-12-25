import React from 'react';

const Navbar = ({ onNavigateHome }) => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="font-bold text-xl tracking-tight text-gray-900">BeyondChats</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                <button onClick={onNavigateHome} className="text-gray-900 hover:text-black transition">Dashboard</button>
                <button onClick={onNavigateHome} className="hover:text-black transition">Articles</button>
                {/* <button className="hover:text-black transition">Settings</button> */}
            </div>
            <div className="w-10"></div> {/* Spacer to balance layout if needed, or just empty */}
        </nav>
    );
};

export default Navbar;
