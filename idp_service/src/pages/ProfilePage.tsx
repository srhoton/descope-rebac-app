import React from 'react';
import { useUser } from '@descope/react-sdk';
import UserProfile from '../components/UserProfile';
import LogoutButton from '../components/LogoutButton';

/**
 * Profile page component - displays authenticated user information
 */
function ProfilePage(): React.ReactElement {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">Unable to load user information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <LogoutButton />
        </div>

        <UserProfile user={user} />
      </div>
    </div>
  );
}

export default ProfilePage;
