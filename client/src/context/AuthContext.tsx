import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { userService } from '../services/api';

export type AuthUser = {
    _id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Member' | string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
};

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await userService.getProfile();
            setUser(res.data);
        } catch (err: any) {
            // Invalid/expired token -> force sign-in
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        refreshUser,
        logout,
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
