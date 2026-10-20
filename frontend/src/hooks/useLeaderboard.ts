import { useQuery } from "@tanstack/react-query";
import type { LeaderboardUser } from "../types/leaderboardTypes";
import { queryKeys } from "../queries/queryKeys";

interface LeaderboardResponse {
    topUsers: LeaderboardUser[];
    currentUser?: LeaderboardUser;
};

const fetchLeaderboard = async (): Promise<LeaderboardResponse> => {
    const respond = await fetch('/api/leaderboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json '
        },
        credentials: 'include',
    });

    if (!respond.ok){
        const errroData = await respond.json().catch(() => ({}));
        throw new Error(
            errroData.message || `Server error while fetching data: ${respond.status}`
        );
    }

    return respond.json();
}

const useLeaderboard = () => {
    return useQuery({
        queryKey: queryKeys.users.leaderboard(),
        queryFn: fetchLeaderboard,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}

export default useLeaderboard;