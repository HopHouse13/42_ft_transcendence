import React from 'react';
import { Link } from 'react-router-dom';
import { useFriends } from '../../hooks/useFriends';
import { FriendAvatar } from './FriendAvatar';
import type { FriendUser } from '../../types/friendTypes';

interface Props {
  onChallenge: (friend: FriendUser) => void;
}

export function FriendList({ onChallenge }: Props): React.JSX.Element {
  const { friends, removeFriend } = useFriends();

  if (friends.length === 0)
    return <p className="text-sm text-base-content/60">You have no friends yet. Use “Add” to find players.</p>;

  function handleRemove(friend: FriendUser) {
    if (window.confirm(`Remove ${friend.username} from your friends?`))
      void removeFriend(friend.id);
  }

  return (
    <ul className="space-y-2">
      {friends.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 p-3">
          <Link to={`/profile/${f.id}`} className="flex min-w-0 items-center gap-3">
            <FriendAvatar avatarUrl={f.avatarUrl} username={f.username} online={f.online} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{f.username}</p>
              <p className="text-xs opacity-60">Elo {f.elo} · {f.online ? 'Online' : 'Offline'}</p>
            </div>
          </Link>

          <div className="flex gap-2">
            <button
              className="btn btn-soft btn-success btn-sm"
              disabled={!f.online}
              title={f.online ? 'Invite to a game' : 'Your friend is offline'}
              onClick={() => onChallenge(f)}
            >
              Play
            </button>
            <button className="btn btn-ghost btn-sm text-error" onClick={() => handleRemove(f)}>
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}