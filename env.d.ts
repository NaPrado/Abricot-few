/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_COGNITO_DOMAIN?: string
  readonly VITE_COGNITO_CLIENT_ID?: string
  readonly VITE_COGNITO_REDIRECT_URI?: string
  readonly VITE_COGNITO_SCOPES?: string
  readonly VITE_FRONTEND_CALLBACK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
