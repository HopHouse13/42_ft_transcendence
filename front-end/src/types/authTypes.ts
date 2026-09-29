export type AuthMode = "login" | "register";

export type AuthProvider = "google" | "github"

export interface AuthUser {
    id: string;
    username: string;
    avatarUrl: string;
}

export interface AuthResult {
	success: boolean;
	message?: string;
	user?: AuthUser;
}
