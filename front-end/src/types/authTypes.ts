export type AuthMode = "login" | "register";

export type AuthProvider = "google" | "github"

export interface User{
    id: number;
    username: string;
}

export interface AuthResult {
	success: boolean;  
	message?: string;
	user?: {id: number, username: string};
}
