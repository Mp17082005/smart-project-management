import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
