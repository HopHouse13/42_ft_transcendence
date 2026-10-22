import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useUserProfile } from '../hooks/useUserProfile';

import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { MatchHistory } from '../components/profile/MatchHistory';
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import AchievementPreview from '../components/profile/ArchievementPreview';
import { useToast } from '../hooks/useToast';

export default function UserProfile(): React.JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading, error, isSelf, updateProfile } = useUserProfile(userId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();

  const handleSaveProfile = async (formData: FormData) => {
    await updateProfile(formData);
    toast.success('Profile updated successfully!');
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="alert alert-error max-w-2xl mx-auto my-8"><span>{error}</span></div>;
  if (!profile) return <></>;

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto p-4 space-y-6">
      <ProfileHeader
        user={profile.user}
        isSelf={isSelf}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <ProfileStats stats={profile.stats} />
      <MatchHistory matches={profile.recentMatches} />
      <AchievementPreview userId={userId || profile.user.id} />

      {isSelf && (
        <EditProfileModal
          user={profile.user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}