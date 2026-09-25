import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import type { AuthProvider, AuthResult } from "../types/authTypes";

interface UseAuthReturn {
	loading: boolean;
	error: string | null;
	authWithSocial: ( provider: AuthProvider ) => void;
	// authWithSocial: ( provider: AuthProvider,  ) => Promise<AuthResult>;
	login: (email: string, password: string) => Promise<AuthResult>;
	register: (username: string, email: string, password: string) => Promise<AuthResult>;
	forgotPassword: (email: string) => Promise<AuthResult>;
	resetPassword: (password: string, token?: string) => Promise<AuthResult>;
	logout: () => Promise<AuthResult>;
}

export function useAuth(): UseAuthReturn {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { setUser } = useAuthContext();

	const request = async (
		endpoint: string,
		body: Record<string, unknown>
	): Promise<AuthResult> =>{
		setLoading(true);
		setError(null);
		try{
			const res = await fetch(`/api/auth/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: 'include',
				body: JSON.stringify(body),
			});
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				const message = data.message ?? "Something went wrong"; // Erreur sans message d'erreur retourne
				setError(message);
				return { success: false, message };
			}

			const user = data.userPublic ?? data.user;
            if (user) {
                setUser(user);
            }
			return { success: true, user };

		} catch {
			const message = "Network error, please try again";
			setError(message);
			return {success: false, message};
		} finally {
			setLoading(false);
		}
	};

	const authWithSocial = (provider: AuthProvider) =>
		(window.location.href = `/api/auth/${provider}`);

	const login = (email: string, password: string) =>
		request("login", { email, password });

	const register = (username: string, email: string, password: string) =>
		request("register", {username, email, password});

	const forgotPassword = (email: string) =>
		request("forgot-password", { email });

	const resetPassword = (password: string, token?: string) =>
		request("reset-password", { password, token });

	const logout = () =>
		request("logout", {}); 

	return { loading, error, authWithSocial, login, register, forgotPassword, resetPassword, logout };
}

// Résumé du flux
// 1. L'utilisateur appelle une fonction (ex: login).
// 2. La fonction request est appelée avec les bons paramètres.
// 3. fetch envoie une requête POST à l'API.
// 4. Si la réponse est OK → Retourne { success: true }.
// 5. Si la réponse échoue → Met à jour error et retourne { success: false, message }.
// 6. En cas d'erreur réseau → Met à jour error et retourne { success: false, message }.
// 7. loading est désactivé dans tous les cas.
