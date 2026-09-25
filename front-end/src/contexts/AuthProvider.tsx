import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import type { User } from "../types/authTypes";

export function AuthProvider({ children }: {children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {

                let res = await fetch('/api/auth/me', {credentials: 'include'});
                
                if (res.status === 401) {
                    const refreshRes = await fetch('/api/auth/refresh', {
                        method: "POST",
                        credentials: "include",
                    });
                    
                    if (refreshRes.ok) {
                        res = await fetch('/api/auth/me', {credentials: 'include'});
                    }
                }
                
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.userPublic ?? data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            };
        };

        fetchMe();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
}