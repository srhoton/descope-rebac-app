import React, { useState } from 'react';
import type { DescopeTenant } from '../types/user.types';
import { formatTenantName } from '../utils/descope.utils';

interface TenantSelectorProps {
  tenants: DescopeTenant[];
  currentTenant?: DescopeTenant;
  onTenantChange: (tenant: DescopeTenant) => void;
}

/**
 * Tenant selector component for switching between tenants
 * NOTE: This component is a placeholder. The Descope React SDK may provide
 * built-in tenant switching functionality. Check SDK documentation first.
 */
function TenantSelector({
  tenants,
  currentTenant,
  onTenantChange,
}: TenantSelectorProps): React.ReactElement {
  const [isChanging, setIsChanging] = useState(false);

  const handleTenantChange = async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const tenantId = event.target.value;
    const tenant = tenants.find((t) => t.tenantId === tenantId);

    if (!tenant) {
      return;
    }

    try {
      setIsChanging(true);
      await onTenantChange(tenant);
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (tenants.length <= 1) {
    return <></>;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tenant</h2>
      <div className="relative">
        <select
          value={currentTenant?.tenantId ?? ''}
          onChange={handleTenantChange}
          disabled={isChanging}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Select tenant"
        >
          {tenants.map((tenant) => (
            <option key={tenant.tenantId} value={tenant.tenantId}>
              {formatTenantName(tenant)}
            </option>
          ))}
        </select>
        {isChanging && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
      {currentTenant?.roleNames && currentTenant.roleNames.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Roles</h3>
          <div className="flex flex-wrap gap-2">
            {currentTenant.roleNames.map((role, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantSelector;
