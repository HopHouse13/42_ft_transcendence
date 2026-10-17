import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { queryKeys } from "../queries/queryKeys";
import type { AuthUser } from "../types/authTypes";

interface AuthSession {
	user: AuthUser | null;
	isAuthenticated: boolean;
	loading: boolean;
	setUser: Dispatch<SetStateAction<AuthUser | null>>;
}

export function useAuthSession(): AuthSession {
	const queryClient = useQueryClient();
	const { data: user = null, isPending: loading } = useQuery<AuthUser | null>({
		queryKey: queryKeys.auth.me(),
		queryFn: async () => {
			const response = await fetch("/api/auth/me", { credentials: "include" });

			if (response.status === 204) {
				return null;
			}

			if (!response.ok) {
				throw new Error(`Network error: ${response.status}`);
			}

			const data = await response.json();
			return data.userPublic ?? data;
		},
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	const setUser: Dispatch<SetStateAction<AuthUser | null>> = (newUser) => {
		queryClient.setQueryData<AuthUser | null>(
			queryKeys.auth.me(),
			(currentUser) =>
				typeof newUser === "function" ? newUser(currentUser ?? null) : newUser,
		);
	};

	return { user, isAuthenticated: !!user, loading, setUser };
}
