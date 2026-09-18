import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import type { User } from "../types/authTypes";

export function AuthProvider({ children }: {children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetch('/api/auth/me',
            {credentials: 'include'})
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data?.user ?? null))
        .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
}