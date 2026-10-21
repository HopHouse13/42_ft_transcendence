import React from 'react';
import type { UserProfileData } from '../../types/profileTypes';

// 1. Add 'onEditClick' to the interface props
interface ProfileHeaderProps {
  user: UserProfileData['user'];
  isSelf: boolean;
  onEditClick?: () => void;
}

export function ProfileHeader({
  user,
  isSelf,
  onEditClick,
}: ProfileHeaderProps): React.JSX.Element {
  return (
    <div className="card bg-base-200 border border-base-300 shadow-xl">
      <div className="card-body flex-col sm:flex-row items-center">
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-offset-base-100 ring-offset-2">
            <img
              src={`/api${user?.avatarUrl || '/default.png'}`}
              alt={`${user?.username} avatar`}
            />
          </div>
        </div>

        <div className="w-full min-w-0 text-center sm:flex-1 sm:text-left px-2">
          <div className="flex min-w-0 flex-col items-center sm:items-start gap-2">
            <h1 className="block w-full min-w-0 truncate text-2xl font-bold"
              title={user?.username}
            >
              {user?.username}
            </h1>
            <div className="flex justify-center sm:justify-start gap-2 ">
              {isSelf && <span className="badge badge-outline text-xs">You</span>}
              <div className="badge badge-success">Elo {user?.elo}</div>
              <div className="badge badge-soft badge-warning">Rank #{user?.rank}</div>
            </div>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Joined{' '}
            {new Date(user?.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="card-actions">
          {isSelf &&
            <button
              onClick={onEditClick}
              className="btn btn-outline btn-sm sm:btn-md"
            >
              Edit Profile
            </button>
          }
        </div>
      </div>
    </div>
  );
}