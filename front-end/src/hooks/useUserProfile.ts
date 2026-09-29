import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from './useAuthContext';
import type { AuthUser } from '../types/authTypes';
import type { UserProfileData } from '../types/profileTypes';
import { queryKeys } from '../queries/queryKeys';

interface ApiMatch {
	id: string;
	opponentId: string;
	opponentElo: number;
	result: 'WIN' | 'LOSS' | 'DRAW';
	score: [number, number];
	date: string;
}

interface ApiProfile extends AuthUser {
	createdAt: string;
	elo: number;
	matchHistory: ApiMatch[];
}

function normalizeProfile(data: ApiProfile): UserProfileData {
	const wins = data.matchHistory.filter((match) => match.result === 'WIN').length;
	const losses = data.matchHistory.filter((match) => match.result === 'LOSS').length;
	const draws = data.matchHistory.filter((match) => match.result === 'DRAW').length;
	const totalGames = data.matchHistory.length;

	return {
		user: {
			id: data.id,
			username: data.username,
			avatarUrl: data.avatarUrl ?? null,
			elo: data.elo,
			rank: 0,
			createdAt: data.createdAt,
		},
		stats: {
			totalGames,
			wins,
			losses,
			draws,
			winRate: totalGames === 0 ? 0 : Math.round((wins / totalGames) * 100),
			avgDisks: totalGames === 0
				? 0
				: Math.round(data.matchHistory.reduce((sum, match) => sum + match.score[0], 0) / totalGames),
		},
		recentMatches: data.matchHistory.map((match) => ({
			matchId: match.id,
			opponent: {
				username: match.opponentId,
				elo: match.opponentElo,
			},
			result: match.result,
			score: {
				user: match.score[0],
				opponent: match.score[1],
			},
			playedAt: match.date,
		})),
	};
}

interface UseUserProfileReturn {
	profile: UserProfileData | null;
	loading: boolean;
	error: string | null;
	isSelf: boolean;
	updateProfile: (formData: FormData) => Promise<void>;
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
	const { user, setUser, loading: authLoading } = useAuthContext();
	const queryClient = useQueryClient();

	const isSelf = !userId || userId === user?.id;
	const targetId = isSelf ? user?.id : userId;

	const profileQuery = useQuery({
		queryKey: queryKeys.users.profile(targetId ?? ''),
		enabled: Boolean(targetId),
		retry: false,
		queryFn: async ({ signal }): Promise<UserProfileData> => {
			if (!targetId) {
				throw new Error('A user ID is required to load a profile.' );
			}

			const res = await fetch(`/api/user/${targetId}/profile`, {
				credentials: 'include',
				headers: { Accept: 'application/json' },
				signal,
			});

			if (res.status === 401) {
				throw new Error('Unauthorized. Please log in again.');
			}
			if (!res.ok) {
				throw new Error('Failed to load user profile.');
			}

			return normalizeProfile((await res.json()) as ApiProfile);
		},
	});

	const updateProfileMutation = useMutation ({
		mutationFn: async (formData: FormData): Promise<AuthUser> => {
			if (!user?.id) {
				throw new Error('You must be authenticated to update your profile.');
			}

			const res = await fetch(`/api/user/${user.id}/profile`, {
				method: 'PATCH',
				credentials: 'include',
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Failed to update profile.');
			}

			return (await res.json()) as AuthUser;
		},
		onSuccess: (updatedUser) => {
			if (isSelf) {
				setUser(updatedUser);
			}

			if (targetId) {
				void queryClient.invalidateQueries({
					queryKey: queryKeys.users.profile(targetId),
				});
			}
		},
	});

	return {
		profile: profileQuery.data ?? null,
		loading: profileQuery.isLoading || (isSelf && authLoading),
		error: profileQuery.error instanceof Error
			? profileQuery.error.message
			: null,
		isSelf,
		updateProfile: async (formData: FormData) => {
			await updateProfileMutation.mutateAsync(formData);
		},
	};
}
