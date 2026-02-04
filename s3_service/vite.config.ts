import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    federation({
      name: 's3-image-service',
      filename: 'remoteEntry.js',

      // Components exposed to host applications
      exposes: {
        // Full page component (includes all functionality)
        './ImagePage': './src/pages/ImageUploadPage.tsx',

        // Individual components for granular use
        './ImageGallery': './src/components/ImageGallery.tsx',
        './ImageUploader': './src/components/ImageUploader.tsx',
        './ShareModal': './src/components/ShareModal.tsx',
        './SharedUsersList': './src/components/SharedUsersList.tsx',

        // UI Components
        './ui/Button': './src/components/ui/Button.tsx',
        './ui/Modal': './src/components/ui/Modal.tsx',
        './ui/Select': './src/components/ui/Select.tsx',

        // Hooks and utilities
        './hooks/useDescope': './src/hooks/useDescope.ts',
        './utils/cn': './src/utils/cn.ts',

        // Contexts (for wrapping)
        './contexts/TenantContext': './src/contexts/TenantContext.tsx',

        // Services (if host needs direct access)
        './services/imageService': './src/services/imageService.ts',
        './services/authTokenProvider': './src/services/authTokenProvider.ts',

        // Federation exports (clean interface)
        './federation': './src/federation/index.ts',

        // Standalone version with embedded providers
        './StandaloneImagePage': './src/federation/StandaloneImagePage.tsx',
      },

      // Shared dependencies (singletons to avoid duplicate React instances)
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.0.0',
        },
        '@descope/react-sdk': {
          singleton: true,
          requiredVersion: '^2.0.0',
        },
        zustand: {
          singleton: true,
          requiredVersion: '^4.0.0',
        },
      },
    }),
  ],

  server: {
    port: 3002,
    open: true,
    cors: true, // Required for cross-origin module loading
  },

  preview: {
    port: 3002,
    cors: true,
  },

  build: {
    target: 'esnext',
    minify: mode === 'production', // Enable minification for production builds
    cssCodeSplit: false, // Keep CSS in single file for federation
    sourcemap: true,
    rollupOptions: {
      output: {
        // Remove manual chunks when using federation - let federation handle it
        format: 'esm',
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/__tests__/'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}));
