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
      <div className="card-body flex-col sm:flex-row items-center gap-6">
        <div className="avatar">
          <div className="w-20 rounded-full ring ring-success ring-offset-base-100 ring-offset-2">
            <img
              src={user.avatarUrl || '/default-avatar.png'}
              alt={user.username}
            />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {isSelf && <span className="badge badge-outline text-xs">You</span>}
            <div className="badge badge-success gap-1">Elo {user.elo}</div>
            <div className="badge badge-ghost">Rank #{user.rank}</div>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Joined{' '}
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="card-actions">
          {isSelf ? (
            <button
              onClick={onEditClick}
              className="btn btn-outline btn-sm sm:btn-md"
            >
              Edit Profile
            </button>
          ) : (
            <button className="btn btn-primary btn-sm sm:btn-md">
              Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}