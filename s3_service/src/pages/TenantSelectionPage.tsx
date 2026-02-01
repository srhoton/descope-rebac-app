/**
 * Tenant selection page for users with multiple tenants
 */

import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant, type Tenant } from '../contexts/TenantContext';
import { useDescope } from '../hooks/useDescope';

/**
 * TenantSelectionPage - Allows users to select which tenant to use
 */
export const TenantSelectionPage: FC = () => {
  const navigate = useNavigate();
  const { tenants, setSelectedTenant, isLoading } = useTenant();
  const { logout, user } = useDescope();

  const handleTenantSelect = (tenant: Tenant): void => {
    setSelectedTenant(tenant);
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
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
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Select Organization
          </h1>
          {user?.email && (
            <p className="text-sm text-gray-500">
              Signed in as {user.email}
            </p>
          )}
          <p className="mt-2 text-gray-600">
            Choose which organization you want to access
          </p>
        </div>

        <div className="space-y-3">
          {tenants.map((tenant) => (
            <button
              key={tenant.tenantId}
              onClick={() => { handleTenantSelect(tenant); }}
              className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="font-medium text-gray-900">
                {tenant.tenantName ?? tenant.tenantId}
              </div>
              {tenant.roleNames && tenant.roleNames.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {tenant.roleNames.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            onClick={logout}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
};
