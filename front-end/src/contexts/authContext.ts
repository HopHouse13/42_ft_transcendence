import { createContext, type Dispatch, type SetStateAction } from "react";
import type { AuthUser } from "../types/authTypes";

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    setUser: Dispatch<SetStateAction<AuthUser | null>>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
