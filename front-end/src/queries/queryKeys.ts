export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        me: () => [...queryKeys.auth.all, 'me'] as const,
    },
    users: {
        all: ['users'] as const,
        profile: (userId: string) =>
            [...queryKeys.users.all, 'profile', userId] as const, 
    },
    achievements: {
        all: ['achievements'] as const,
        user: (userId?: string) => 
            [...queryKeys.achievements.all, 'user', userId] as const,
    }
};
