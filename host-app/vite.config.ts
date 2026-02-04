import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import pkg from './package.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Use environment variable or default to production URL
  const s3ServiceUrl =
    env.VITE_S3_SERVICE_URL || 'https://descope-s3.sb.fullbay.com';

  // Extract @descope/react-sdk version from package.json to keep versions in sync
  const descopeVersion = (pkg.dependencies as Record<string, string>)['@descope/react-sdk'].replace(
    /^\^/,
    ''
  );

  return {
    plugins: [
      react(),
      federation({
        name: 'host-app',

        // Remote applications to load
        remotes: {
          s3ImageService: {
            external: `${s3ServiceUrl}/assets/remoteEntry.js`,
            externalType: 'url',
          },
        },

        // Shared dependencies (must match remote configuration)
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
            // Read version from package.json to keep federation in sync with installed version
            version: descopeVersion,
          },
          zustand: {
            singleton: true,
            requiredVersion: '^4.0.0',
          },
        },
      }),
    ],

    build: {
      target: 'esnext',
    },

    server: {
      port: 3000,
    },

    preview: {
      port: 3000,
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'dist/', 'src/__tests__/'],
      },
    },
  };
});
