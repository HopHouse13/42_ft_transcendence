import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { UserProfileData } from '../types/profileTypes';

interface UseUserProfileReturn {
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  isSelf: boolean;
  updateProfile: (formData: FormData) => Promise<void>;
}

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);

  const isSelf = !userId || userId === currentUser?.id;
  const targetId = isSelf ? currentUser?.id : userId;

  const [profile, setProfile] = useState<UserProfileData | null>(() => {
    if (isSelf && currentUser?.profileData) {
      return currentUser.profileData;
    }
    return null;
  });

  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Derive loading state dynamically during render without synchronously setting state
  const shouldFetch = Boolean(targetId) && !(isSelf && currentUser?.profileData) && !profile;
  const loading = shouldFetch || isFetching;

  useEffect(() => {
    // Only proceed if a fetch is actually required
    if (!targetId || (isSelf && currentUser?.profileData)) {
      return;
    }

    let isMounted = true;

    // Use queueMicrotask to ensure state update happens asynchronously after render cycle
    queueMicrotask(() => {
      if (isMounted) setIsFetching(true);
    });

    fetch(`/api/users/${targetId}/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (!res.ok) {
          throw new Error('Failed to load user profile.');
        }
        return res.json() as Promise<UserProfileData>;
      })
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setIsFetching(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setIsFetching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, currentUser, isSelf, targetId]);

  // Method to update user profile (username and avatar)
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

      if (updateCurrentUser) {
        updateCurrentUser(updatedProfile);
      }
    },
    [updateCurrentUser]
  );

  return {
    profile,
    loading,
    error,
    isSelf,
    updateProfile,
  };
}
