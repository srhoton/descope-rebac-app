import React from 'react';
import { parseCustomAttributes } from '../utils/descope.utils';
import type { DescopeUser } from '../types/user.types';

interface UserProfileProps {
  user: DescopeUser;
}

/**
 * User profile display component showing all user information
 */
function UserProfile({ user }: UserProfileProps): React.ReactElement {
  const customAttributes = parseCustomAttributes(user.customAttributes);

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Basic Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
              {user.userId}
            </dd>
          </div>

          {user.email && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {user.email}
                {user.verifiedEmail && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </dd>
            </div>
          )}

          {user.name && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
            </div>
          )}

          {user.givenName && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Given Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.givenName}</dd>
            </div>
          )}

          {user.familyName && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Family Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.familyName}</dd>
            </div>
          )}

          {user.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {user.phone}
                {user.verifiedPhone && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </dd>
            </div>
          )}

          {user.loginIds && user.loginIds.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Login IDs</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {user.loginIds.map((loginId, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {loginId}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Custom Attributes Card */}
      {Object.keys(customAttributes).length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Custom Attributes
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(customAttributes).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-gray-500 capitalize">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 break-words">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Profile Picture */}
      {user.picture && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Picture
          </h2>
          <img
            src={user.picture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default UserProfile;
