import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import type { UserProfileData } from '../types/profileTypes';

interface UseUserProfileReturn {
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  isSelf: boolean;
  updateProfile: (formData: FormData) => Promise<void>;
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const { user, setUser } = useAuthContext();

  const isSelf = !userId || userId === user?.id;
  const targetId = isSelf ? user?.id : userId;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId) {
      setProfile(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/users/${targetId}/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (!res.ok) {
          throw new Error('Failed to load user profile.');
        }

        return (await res.json()) as UserProfileData;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setProfile(data);
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [targetId]);

  const updateProfile = useCallback(
    async (formData: FormData): Promise<void> => {
      const res = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update profile.');
      }

      const updatedProfile: UserProfileData = await res.json();

      setProfile(updatedProfile);

      if (isSelf && user) {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          return {
            ...prevUser,
            username: updatedProfile.user.username,
            avatarUrl: updatedProfile.user.avatarUrl ?? prevUser.avatarUrl ?? null,
          };
        });
      }
    },
    [isSelf, setUser, user]
  );

  return {
    profile,
    loading,
    error,
    isSelf,
    updateProfile,
  };
}
