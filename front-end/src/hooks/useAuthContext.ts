import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

export function useAuthContext() {
    const context = useContext(AuthContext);

    if (!context)
        throw new Error('useAuthContext must be use within AuthProvider');
    return context;
}