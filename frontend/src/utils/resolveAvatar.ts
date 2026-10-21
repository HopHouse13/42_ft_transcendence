// check if there already is a /api prefix or not for the avatarUrl
export const resolveAvatar = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('/api')) return url; // Already safe
    return `/api${url.startsWith('/') ? '' : '/'}${url}`; // Missing prefix
};