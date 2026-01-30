/**
 * Component displaying users an image has been shared with
 */

import { useState, type FC } from 'react';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { appSyncClient } from '../services/appsyncClient';
import type { SharedUser } from '../types/sharing';

export interface SharedUsersListProps {
  imageId: string;
  imageName: string;
  sharedUsers: SharedUser[];
  onUnshareSuccess: () => void;
}

/**
 * Displays list of users with viewer access and allows unsharing
 */
export const SharedUsersList: FC<SharedUsersListProps> = ({
  imageId,
  imageName,
  sharedUsers,
  onUnshareSuccess,
}) => {
  const [selectedUser, setSelectedUser] = useState<SharedUser | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnshareClick = (user: SharedUser): void => {
    setSelectedUser(user);
    setShowConfirm(true);
    setError(null);
  };

  const handleUnshare = async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }

    setIsUnsharing(true);
    setError(null);

    try {
      await appSyncClient.deleteViewerRelation(imageId, selectedUser.userId);
      onUnshareSuccess();
      setShowConfirm(false);
      setSelectedUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove access';
      setError(message);
      console.error('Error unsharing image:', err);
    } finally {
      setIsUnsharing(false);
    }
  };

  if (sharedUsers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Shared with:</h4>
        <div className="space-y-2">
          {sharedUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.name ?? user.email}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { handleUnshareClick(user); }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Unshare
              </Button>
            </div>
          ))}
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedUser(null);
          setError(null);
        }}
        onConfirm={handleUnshare}
        title="Remove Access"
        message={`Remove access for ${selectedUser?.name ?? selectedUser?.email} (${selectedUser?.email})? They will no longer be able to view "${imageName}".`}
        confirmText="Remove Access"
        variant="danger"
        isLoading={isUnsharing}
      />
    </>
  );
};
