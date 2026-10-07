import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '../queries/queryKeys';
import type { FriendRequests, FriendUser, SearchResult } from '../types/friendTypes';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/friends${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'Something went wrong.');
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useFriends(searchTerm = '') {
  const queryClient = useQueryClient();
  const q = useDebounce(searchTerm.trim());

  const friendsQuery = useQuery({
    queryKey: queryKeys.friends.list(),
    queryFn: () => api<FriendUser[]>(''),
    refetchInterval: 30_000, // met à jour le statut en ligne
  });

  const requestsQuery = useQuery({
    queryKey: queryKeys.friends.requests(),
    queryFn: () => api<FriendRequests>('/requests'),
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.friends.search(q),
    queryFn: () => api<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });

  const sendRequest = useMutation({
    mutationFn: (userId: string) =>
      api('/requests', { method: 'POST', body: JSON.stringify({ userId }) }),
    onSuccess: invalidate,
  });

  const acceptRequest = useMutation({
    mutationFn: (requestId: string) =>
      api(`/requests/${requestId}/accept`, { method: 'POST' }),
    onSuccess: invalidate,
  });

  // Sert à refuser une invitation reçue ou à annuler une invitation envoyée
  const removeRequest = useMutation({
    mutationFn: (requestId: string) =>
      api(`/requests/${requestId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const removeFriend = useMutation({
    mutationFn: (userId: string) => api(`/${userId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  return {
    friends: friendsQuery.data ?? [],
    requests: requestsQuery.data ?? { received: [], sent: [] },
    searchResults: q.length >= 2 ? (searchQuery.data ?? []) : [],
    searching: searchQuery.isFetching,
    loading: friendsQuery.isLoading || requestsQuery.isLoading,
    error:
      (friendsQuery.error ?? requestsQuery.error ?? searchQuery.error) instanceof Error
        ? (friendsQuery.error ?? requestsQuery.error ?? searchQuery.error)!.message
        : null,
    sendRequest: sendRequest.mutateAsync,
    acceptRequest: acceptRequest.mutateAsync,
    removeRequest: removeRequest.mutateAsync,
    removeFriend: removeFriend.mutateAsync,
  };
}