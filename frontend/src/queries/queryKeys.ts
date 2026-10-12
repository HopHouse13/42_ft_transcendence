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
};