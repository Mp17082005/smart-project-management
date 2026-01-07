import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../context/AuthContext';

const ProtectedLayout: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default ProtectedLayout;
