import React from 'react';

export function ProfileSkeleton(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="skeleton h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-xl" />
      </div>
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}