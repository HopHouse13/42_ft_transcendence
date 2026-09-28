import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from './useAuthContext';
import type { UserProfileData } from '../types/profileTypes';
import { queryKeys } from '../queries/queryKeys';

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

			const res = await fetch(`/api/users/${targetId}/profile`, {
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

			return (await res.json()) as UserProfileData;
		},
	});

	const updateProfileMutation = useMutation ({
		mutationFn: async (formData: FormData): Promise<UserProfileData> => {
			const res = await fetch('/api/users/me/profile', {
				method: 'PATCH',
				credentials: 'include',
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Failed to update profile.');
			}

			return (await res.json()) as UserProfileData;
		},
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(
				queryKeys.users.profile(updatedProfile.user.id),
				updatedProfile,
			);

			if (isSelf) {
				setUser((prevUser) => {
					if (!prevUser)
						return prevUser;

					return {
						...prevUser,
						username: updatedProfile.user.username,
						avatarUrl: updatedProfile.user.avatarUrl,
					};
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
