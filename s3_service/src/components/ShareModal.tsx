/**
 * Modal for sharing images with users
 */

import { useState, useEffect, type FC } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Select, type SelectOption } from './ui/Select';
import { ConfirmDialog } from './ConfirmDialog';
import { orgServiceClient } from '../services/orgServiceClient';
import { memberServiceClient } from '../services/memberServiceClient';
import { appSyncClient } from '../services/appsyncClient';
import type { Tenant, Member } from '../types/sharing';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  imageName: string;
  onShareSuccess: () => void;
  existingViewers: string[]; // User IDs that already have access
}

type Step = 'tenant' | 'user' | 'confirm';

/**
 * Multi-step modal for sharing images with users
 */
export const ShareModal: FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageId,
  imageName,
  onShareSuccess,
  existingViewers,
}) => {
  const [step, setStep] = useState<Step>('tenant');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load tenants when modal opens
  useEffect(() => {
    if (isOpen) {
      void loadTenants();
    } else {
      // Reset state when modal closes
      setStep('tenant');
      setSelectedTenant(null);
      setSelectedMember(null);
      setTenants([]);
      setMembers([]);
      setError(null);
    }
  }, [isOpen]);

  // Load members when tenant is selected
  useEffect(() => {
    if (selectedTenant) {
      void loadMembers(selectedTenant.id);
    }
  }, [selectedTenant]);

  const loadTenants = async (): Promise<void> => {
    setIsLoadingTenants(true);
    setError(null);

    try {
      const result = await orgServiceClient.listTenants();
      setTenants(result.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tenants';
      setError(message);
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoadingTenants(false);
    }
  };

  const loadMembers = async (tenantId: string): Promise<void> => {
    setIsLoadingMembers(true);
    setError(null);

    try {
      const result = await memberServiceClient.listMembers(tenantId);
      // Filter out members who already have access
      const availableMembers = result.items.filter(
        (member) => !existingViewers.includes(member.loginId)
      );
      setMembers(availableMembers);
      setStep('user');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load members';
      setError(message);
      console.error('Error loading members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleTenantSelect = (tenantId: string): void => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
    }
  };

  const handleMemberSelect = (loginId: string): void => {
    const member = members.find((m) => m.loginId === loginId);
    if (member) {
      setSelectedMember(member);
    }
  };

  const handleConfirmClick = (): void => {
    if (selectedMember) {
      setShowConfirm(true);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!selectedMember) {
      return;
    }

    setIsSharing(true);
    setError(null);

    try {
      await appSyncClient.createViewerRelation(imageId, selectedMember.loginId);
      onShareSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share image';
      setError(message);
      console.error('Error sharing image:', err);
    } finally {
      setIsSharing(false);
      setShowConfirm(false);
    }
  };

  const tenantOptions: SelectOption[] = tenants.map((tenant) => ({
    value: tenant.id,
    label: tenant.name,
  }));

  const memberOptions: SelectOption[] = members.map((member) => ({
    value: member.loginId,
    label: `${member.name ?? member.email} (${member.email})`,
  }));

  const getModalTitle = (): string => {
    if (step === 'tenant') {
      return 'Share Image - Select Tenant';
    }
    if (step === 'user') {
      return 'Share Image - Select User';
    }
    return 'Share Image';
  };

  return (
    <>
      <Modal isOpen={isOpen && !showConfirm} onClose={onClose} title={getModalTitle()}>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}

          {step === 'tenant' && (
            <>
              <p className="text-sm text-gray-600">
                Select the tenant containing the user you want to share with.
              </p>
              {isLoadingTenants ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
                </div>
              ) : (
                <Select
                  options={tenantOptions}
                  onChange={handleTenantSelect}
                  placeholder="Select a tenant"
                  label="Tenant"
                />
              )}
              <div className="flex justify-end">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}

          {step === 'user' && (
            <>
              <p className="text-sm text-gray-600">
                Select a user from{' '}
                <span className="font-semibold">{selectedTenant?.name}</span> to share
                this image with.
              </p>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
                  No available users in this tenant. All users may already have access.
                </div>
              ) : (
                <Select
                  options={memberOptions}
                  value={selectedMember?.loginId ?? ''}
                  onChange={handleMemberSelect}
                  placeholder="Select a user"
                  label="User"
                />
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('tenant');
                    setSelectedTenant(null);
                    setSelectedMember(null);
                    setMembers([]);
                  }}
                >
                  Back
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                {selectedMember && (
                  <Button variant="primary" onClick={handleConfirmClick}>
                    Share
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); }}
        onConfirm={handleShare}
        title="Confirm Share"
        message={`Share image "${imageName}" with ${selectedMember?.name ?? selectedMember?.email} (${selectedMember?.email})?`}
        confirmText="Share"
        variant="primary"
        isLoading={isSharing}
      />
    </>
  );
};
