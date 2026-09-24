import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { MatchHistory } from '../components/profile/MatchHistory';
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Toast, type ToastType } from '../components/ui/Toast';

export default function UserProfile(): React.JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading, error, isSelf, updateProfile } = useUserProfile(userId);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Toast state management
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSaveProfile = async (formData: FormData) => {
    try {
      await updateProfile(formData);
      setToast({
        message: 'Profile updated successfully!',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to update profile.',
        type: 'error',
      });
      throw err; // Re-throw to allow the modal to handle submitting state
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="alert alert-error max-w-2xl mx-auto my-8"><span>{error}</span></div>;
  if (!profile) return <></>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ProfileHeader
        user={profile.user}
        isSelf={isSelf}
        onEditClick={() => setIsEditModalOpen(true)}
      />
      <ProfileStats stats={profile.stats} />
      <MatchHistory matches={profile.recentMatches} />

      {isSelf && (
        <EditProfileModal
          user={profile.user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Render Toast notification when active */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}