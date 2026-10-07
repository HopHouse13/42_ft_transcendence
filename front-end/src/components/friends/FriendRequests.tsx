import React from 'react';
import { useFriends } from '../../hooks/useFriends';
import { FriendAvatar } from './FriendAvatar';

export function FriendRequests(): React.JSX.Element {
  const { requests, acceptRequest, removeRequest } = useFriends();

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 font-semibold">Received ({requests.received.length})</h3>
        {requests.received.length === 0 && (
          <p className="text-sm text-base-content/60">No pending invitation.</p>
        )}
        <ul className="space-y-2">
          {requests.received.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 p-3">
              <div className="flex items-center gap-3">
                <FriendAvatar avatarUrl={r.user.avatarUrl} username={r.user.username} />
                <span className="font-semibold">{r.user.username}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => acceptRequest(r.id)}>Accept</button>
                <button className="btn btn-ghost btn-sm" onClick={() => removeRequest(r.id)}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Sent ({requests.sent.length})</h3>
        <ul className="space-y-2">
          {requests.sent.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 p-3">
              <div className="flex items-center gap-3">
                <FriendAvatar avatarUrl={r.user.avatarUrl} username={r.user.username} />
                <span>{r.user.username}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => removeRequest(r.id)}>Cancel</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}