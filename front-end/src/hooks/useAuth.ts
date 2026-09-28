import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthProvider, AuthResult, AuthUser } from '../types/authTypes';
import { queryKeys } from '../queries/queryKeys';

interface AuthResponse {
  userPublic?: AuthUser;
  message?: string;
}

interface AuthVariables {
  endpoint: string;
  body: Record<string, unknown>;
}

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  authWithSocial: (provider: AuthProvider) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string, token?: string) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();

  const authMutation = useMutation<AuthResponse, Error, AuthVariables>({
	mutationFn: async ({ endpoint, body }) => {
	  const response = await fetch(`/api/auth/${endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body),
	  });

	  const data = (await response.json().catch(() => ({}))) as AuthResponse;

	  if (!response.ok) {
		throw new Error(data.message ?? 'Something went wrong.');
	  }

	  return data;
	},

	onSuccess: (data, variables) => {
	  if (variables.endpoint === 'logout') {
		queryClient.setQueryData(queryKeys.auth.me(), null);
		return;
	  }

	  if (
		variables.endpoint === 'login' ||
		variables.endpoint === 'register' ||
		variables.endpoint === 'reset-password'
	) {
		const authenticatedUser = data.userPublic;

		if (authenticatedUser) {
		  queryClient.setQueryData(queryKeys.auth.me(), authenticatedUser);
		}
	  }
	},
  });

  const request = async (
	endpoint: string,
	body: Record<string, unknown>,
  ): Promise<AuthResult> => {
	try {
	  const data = await authMutation.mutateAsync({ endpoint, body });

	  return {
		success: true,
		user: data.userPublic,
	  };
	} catch (error) {
	  return {
		success: false,
		message: error instanceof Error
		  ? error.message
		  : 'Network error, please try again.',
	  };
	}
  };

  const authWithSocial = (provider: AuthProvider) => {
	window.location.href = `/api/auth/${provider}`;
  };

	const logout = async (): Promise<AuthResult> => {
		const result = await request('logout', {});
		
		if (result.success) {
			await queryClient.cancelQueries({
				queryKey: queryKeys.users.all,
			});

			queryClient.removeQueries({
				queryKey: queryKeys.users.all,
			});
		}
		
		return result;
	};

  return {
	loading: authMutation.isPending,
	error: authMutation.error?.message ?? null,
	authWithSocial,
	login: (email, password) => request('login', { email, password }),
	register: (username, email, password) =>
	  request('register', { username, email, password }),
	forgotPassword: (email) => request('forgot-password', { email }),
	resetPassword: (password, token) =>
	  request('reset-password', { password, token }),
	logout,
  };
}
