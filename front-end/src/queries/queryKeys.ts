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
    friends: {
        all: ['friends'] as const,
        list: () => [...queryKeys.friends.all, 'list'] as const,
        requests: () => [...queryKeys.friends.all, 'requests'] as const,
        search: (q: string) => [...queryKeys.friends.all, 'search', q] as const,
    },
};