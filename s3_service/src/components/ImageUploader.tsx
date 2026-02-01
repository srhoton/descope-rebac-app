/**
 * Image uploader component with drag-and-drop support
 */

import { useCallback, useState, type FC, type ChangeEvent, type DragEvent } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, type AllowedImageType } from '../types/image';
import { imageService } from '../services/imageService';
import { useDescope } from '../hooks/useDescope';

/**
 * Type guard to check if a string is an allowed image type
 */
function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

interface ImageUploaderProps {
  onUploadComplete: () => void;
}

/**
 * Component for uploading images with drag-and-drop support
 */
export const ImageUploader: FC<ImageUploaderProps> = ({ onUploadComplete }) => {
  const { user } = useDescope();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!isAllowedImageType(file.type)) {
      return `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`;
    }

    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        await imageService.completeImageUpload(file, user.userId);
        onUploadComplete();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload image';
        setError(message);
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [user, onUploadComplete]
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleDrag = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      void handleUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-primary-50 cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            {isUploading ? (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-primary-600">Click to upload</span> or drag
                  and drop
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP, SVG up to {MAX_FILE_SIZE / 1024 / 1024}MB
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
