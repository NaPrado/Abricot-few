import { http } from './http'

export interface CognitoTokenHash {
  accessToken: string
  idToken?: string
  refreshToken?: string
  expiresIn?: number
}

export interface CognitoCallbackError {
  error: string
  errorDescription?: string
}

export interface AuthTestResponse {
  ok: boolean
  claims: {
    sub?: string
    email?: string
    token_use?: string
    groups?: string[]
  }
}

type CognitoEnvName =
  | 'VITE_COGNITO_DOMAIN'
  | 'VITE_COGNITO_CLIENT_ID'
  | 'VITE_COGNITO_REDIRECT_URI'
  | 'VITE_COGNITO_SCOPES'

const REQUIRED_COGNITO_ENV: CognitoEnvName[] = [
  'VITE_COGNITO_DOMAIN',
  'VITE_COGNITO_CLIENT_ID',
  'VITE_COGNITO_REDIRECT_URI',
  'VITE_COGNITO_SCOPES',
]

export interface CognitoConfigDiagnostics {
  isConfigured: boolean
  missingVariables: CognitoEnvName[]
  invalidMessages: string[]
  diagnostics: string[]
}

function readEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeCognitoDomain(domain: string): string {
  const trimmed = domain.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.startsWith('https://') || trimmed.startsWith('http://')
    ? trimmed
    : `https://${trimmed}`
}

function validateRedirectUri(redirectUri: string): string[] {
  if (!redirectUri) return []

  try {
    const url = new URL(redirectUri)
    const issues: string[] = []
    if (url.protocol !== 'https:') {
      issues.push('VITE_COGNITO_REDIRECT_URI debe usar HTTPS.')
    }
    if (!url.pathname.endsWith('/callback') || url.pathname.endsWith('/auth/callback')) {
      issues.push('VITE_COGNITO_REDIRECT_URI debe apuntar a API Gateway /callback, no a /auth/callback.')
    }
    return issues
  } catch {
    return ['VITE_COGNITO_REDIRECT_URI no es una URL valida.']
  }
}

export function getCognitoConfigDiagnostics(): CognitoConfigDiagnostics {
  const missingVariables = REQUIRED_COGNITO_ENV.filter((name) => !readEnv(name))
  const invalidMessages = validateRedirectUri(readEnv('VITE_COGNITO_REDIRECT_URI'))
  const diagnostics = [
    ...missingVariables.map((name) => `Falta ${name}.`),
    ...invalidMessages,
  ]

  return {
    isConfigured: diagnostics.length === 0,
    missingVariables,
    invalidMessages,
    diagnostics,
  }
}

export function isCognitoConfigured(): boolean {
  return getCognitoConfigDiagnostics().isConfigured
}

function buildCognitoHostedUiUrl(path: 'login' | 'signup'): string {
  const diagnostics = getCognitoConfigDiagnostics()
  if (!diagnostics.isConfigured) {
    throw new Error(diagnostics.diagnostics.join(' '))
  }

  const domain = normalizeCognitoDomain(readEnv('VITE_COGNITO_DOMAIN'))
  const clientId = readEnv('VITE_COGNITO_CLIENT_ID')
  const redirectUri = readEnv('VITE_COGNITO_REDIRECT_URI')
  const scopes = readEnv('VITE_COGNITO_SCOPES') || 'openid email profile'

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
  })

  return `${domain}/${path}?${params.toString()}`
}

export function buildCognitoLoginUrl(): string {
  return buildCognitoHostedUiUrl('login')
}

export function buildCognitoSignupUrl(): string {
  return buildCognitoHostedUiUrl('signup')
}

export function redirectToCognitoSignup(): void {
  window.location.assign(buildCognitoSignupUrl())
}

export function parseCognitoCallbackHash(hash: string): CognitoTokenHash | CognitoCallbackError {
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(rawHash)
  const error = params.get('error')

  if (error) {
    return {
      error,
      errorDescription: params.get('error_description') ?? undefined,
    }
  }

  const accessToken = params.get('access_token')
  if (!accessToken) {
    return {
      error: 'missing_access_token',
    }
  }

  const expiresInRaw = params.get('expires_in')
  const expiresIn = expiresInRaw ? Number(expiresInRaw) : undefined

  return {
    accessToken,
    idToken: params.get('id_token') ?? undefined,
    refreshToken: params.get('refresh_token') ?? undefined,
    expiresIn: Number.isFinite(expiresIn) ? expiresIn : undefined,
  }
}

export const cognitoAuthService = {
  authTest: () => http.get<AuthTestResponse>('/auth-test', { authMode: 'access' }),
}
