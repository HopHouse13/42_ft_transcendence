export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        me: () => [...queryKeys.auth.all, 'me'] as const,
    },
    users: {
        all: ['users'] as const,
        profile: (userId: string) =>
            [...queryKeys.users.all, 'profile', userId] as const,
        leaderboard: () => [...queryKeys.users.all, 'leaderboard'] as const,
    },
    achievements: {
        all: ['achievements'] as const,
        user: (userId?: string) => 
            [...queryKeys.achievements.all, 'user', userId] as const,
    },
	friends: {
		all: ['friends'] as const,
		list: (userId: string) =>
			[...queryKeys.friends.all, userId, 'list'] as const,
		search: (userId: string, query: string ) =>
			[...queryKeys.friends.all, userId, 'search', query] as const,
	},
};
