import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./authContext";
import { queryKeys } from "../queries/queryKeys";
import type { AuthUser } from "../types/authTypes";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	
	const { data: user = null, isPending: loading } = useQuery<AuthUser | null>({
		queryKey: queryKeys.auth.me(),
		queryFn: async () => {
			let res = await fetch('/api/auth/me', { credentials: 'include' });

			//if (res.status === 401) {
			//	const refreshRes = await fetch('/api/auth/refresh', {
			//		method: "POST",
			//		credentials: "include",
			//	});
	
			//	if (refreshRes.ok) {
			//		res = await fetch('/api/auth/me', { credentials: 'include' });
			//	}
			//}
			
			//if (res.ok) {
			//	const data = await res.json();
			//	return (data.userPublic ?? data);
			//}

			//if (res.status === 401) {
			//	return null;
			//}

			if ( res.status === 204 ) // pas de session active
				return null;

			if ( res.ok ) // session active: recuperation du userPublic
			{
				const data = await res.json();
				return (data.userPublic ?? data);
			}

			throw new Error(`Network error: ${res.status}`); // souleve l'erreur de la reponse
		},
		retry: false,
		staleTime: 5 * 60 * 1000,
	})

	const setUser = (newUser: AuthUser | null | ((prevUser: AuthUser | null ) => AuthUser | null)) => {
		queryClient.setQueryData(queryKeys.auth.me(), newUser);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}
