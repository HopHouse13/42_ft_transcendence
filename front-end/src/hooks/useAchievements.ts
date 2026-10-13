import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queries/queryKeys";
import type { UserAchievement } from "../types/achievementTypes";

const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
    const safeUserId = encodeURIComponent(userId);

    const res = await fetch(`/api/users/${safeUserId}/achievements`, {
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
    });

    if (!res.ok)
        throw new Error('Failed to fetch achievements');
    return (await res.json());
};

export const useAchievement = (userId: string) => {
    return (useQuery({
        queryKey: queryKeys.achievements.user(userId),
        queryFn: () => fetchUserAchievements(userId),
        enabled: Boolean(userId && userId.trim() !== ''),
        staleTime: 5 * 60 * 1000,
    }));
};