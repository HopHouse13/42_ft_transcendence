import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFriends } from '../../hooks/useFriends';
import { FriendAvatar } from './FriendAvatar';
import type { RelationStatus } from '../../types/friendTypes';

const RELATION_LABEL: Record<Exclude<RelationStatus, 'NONE'>, string> = {
  FRIEND: 'Already friends',
  REQUEST_SENT: 'Request sent',
  REQUEST_RECEIVED: 'Check your requests',
};

export function UserSearch(): React.JSX.Element {
  const [term, setTerm] = useState('');
  const { searchResults, searching, sendRequest } = useFriends(term);

  return (
    <div className="space-y-3">
      <input
        type="search"
        className="input w-full"
        placeholder="Search a player by username..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      {searching && <span className="loading loading-dots" />}

      {term.trim().length >= 2 && !searching && searchResults.length === 0 && (
        <p className="text-sm text-base-content/60">No player found.</p>
      )}

      <ul className="space-y-2">
        {searchResults.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 p-3"
          >
            <Link to={`/profile/${u.id}`} className="flex min-w-0 items-center gap-3">
              <FriendAvatar avatarUrl={u.avatarUrl} username={u.username} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{u.username}</p>
                <p className="text-xs opacity-60">Elo {u.elo}</p>
              </div>
            </Link>

            {u.relation === 'NONE' ? (
              <button className="btn btn-primary btn-sm" onClick={() => sendRequest(u.id)}>
                Add friend
              </button>
            ) : (
              <span className="badge badge-ghost">{RELATION_LABEL[u.relation]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}