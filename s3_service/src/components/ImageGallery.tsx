/**
 * Image gallery component displaying user's uploaded images
 */

import { useEffect, useState, type FC } from 'react';
import type { Image } from '../types/image';
import { imageService } from '../services/imageService';
import { useDescope } from '../hooks/useDescope';

interface ImageGalleryProps {
  refreshTrigger: number;
}

/**
 * Gallery component for displaying user's images
 */
export const ImageGallery: FC<ImageGalleryProps> = ({ refreshTrigger }) => {
  const { user } = useDescope();
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userImages = await imageService.getUserImages(user.userId);
        setImages(userImages);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load images';
        setError(message);
        console.error('Error loading images:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadImages();
  }, [user, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
        <strong className="font-bold">Error: </strong>
        <span>{error}</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-4 text-gray-600">No images uploaded yet</p>
        <p className="mt-2 text-sm text-gray-500">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <div
          key={image.imageId}
          className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="aspect-square w-full overflow-hidden bg-gray-100">
            {image.downloadUrl ? (
              <img
                src={image.downloadUrl}
                alt={image.filename}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="truncate text-sm font-medium text-gray-900" title={image.filename}>
              {image.filename}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(image.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
