import React from 'react';

interface Props {
  avatarUrl: string | null;
  username: string;
  online?: boolean;
}

export function FriendAvatar({ avatarUrl, username, online }: Props): React.JSX.Element {
  return (
    <div className={`avatar ${online === undefined ? '' : online ? 'avatar-online' : 'avatar-offline'}`}>
      <div className="w-10 rounded-full">
        <img src={`/api${avatarUrl || '/uploads/avatars/default.png'}`} alt={`${username} avatar`} />
      </div>
    </div>
  );
}