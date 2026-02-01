/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DESCOPE_PROJECT_ID: string;
  readonly VITE_DESCOPE_BASE_URL?: string;
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_APPSYNC_ENDPOINT: string;
  readonly VITE_APPSYNC_ORG_ENDPOINT?: string;
  readonly VITE_APPSYNC_MEMBER_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
