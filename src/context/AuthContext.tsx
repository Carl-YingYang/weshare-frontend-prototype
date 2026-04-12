import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '../api/client';

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    role: string;
    initials: string;
}

interface AuthContextType {
    user: UserProfile | null;
    logout: () => void;
    setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>; // <--- IDINAGDAG ITO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('weshare_token');
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    const userId = decoded.sub;
                    const profileData = await apiFetch(`/Users/${userId}`);
                    setUser(profileData);
                } catch (error) {
                    console.error("Failed to load user profile:", error);
                    logout();
                }
            }
        };

        fetchProfile();
    }, []);

    const logout = () => {
        localStorage.removeItem('weshare_token');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};