/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DESCOPE_PROJECT_ID: string;
  readonly VITE_IDP_DOMAIN: string;
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_APPSYNC_ENDPOINT: string;
  readonly VITE_APPSYNC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
