/**
 * Main image upload page
 */

import { useState, type FC } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ImageGallery } from '../components/ImageGallery';
import { useDescope } from '../hooks/useDescope';

/**
 * Image upload page with uploader and gallery
 */
export const ImageUploadPage: FC = () => {
  const { user, logout } = useDescope();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = (): void => {
    // Increment trigger to refresh the gallery
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Image Upload Service</h1>
              {user && (
                <p className="mt-1 text-sm text-gray-600">
                  Welcome, {user.name ?? user.email ?? user.userId}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Upload Image</h2>
          <ImageUploader onUploadComplete={handleUploadComplete} />
        </section>

        {/* Gallery Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Images</h2>
          <ImageGallery refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-600 sm:px-6 lg:px-8">
          <p>
            Powered by{' '}
            <a
              href="https://www.descope.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              Descope
            </a>{' '}
            and AWS S3
          </p>
        </div>
      </footer>
    </div>
  );
};
