import React, { useState, useRef } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import type { UserProfileData } from '../../types/profileTypes';
import FormField from '../ui/FormField';

interface EditProfileModalProps {
  user: UserProfileData['user'];
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

export function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps): React.JSX.Element | null {
  const [username, setUsername] = useState(user.username);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Selected file must be an image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must not exceed 5 MB.');
        return;
      }

      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username);
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">Edit Profile</h3>

        {error && (
          <div className="alert alert-error text-sm mb-4 py-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={previewUrl || '/default-avatar.png'}
                  alt="Avatar preview"
                />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </button>
          </div>

          <FormField
            label="Username"
            type="text"
            value={username}
            onChange={setUsername}
            required
            minLength={3}
            maxLength={50}
            pattern="^[a-zA-Z0-9][a-zA-Z0-9_]{3,50}$"
			hint="Must be 3-50 letters, digits or underscores. Can't start with an underscore"
          />

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}