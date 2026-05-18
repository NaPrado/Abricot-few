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

export function isCognitoConfigured(): boolean {
  return Boolean(
    readEnv('VITE_COGNITO_DOMAIN') &&
      readEnv('VITE_COGNITO_CLIENT_ID') &&
      readEnv('VITE_COGNITO_REDIRECT_URI'),
  )
}

export function buildCognitoLoginUrl(): string {
  const domain = normalizeCognitoDomain(readEnv('VITE_COGNITO_DOMAIN'))
  const clientId = readEnv('VITE_COGNITO_CLIENT_ID')
  const redirectUri = readEnv('VITE_COGNITO_REDIRECT_URI')
  const scopes = readEnv('VITE_COGNITO_SCOPES') || 'openid email profile'

  if (!domain || !clientId || !redirectUri) {
    throw new Error('Cognito Hosted UI is not configured.')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
  })

  return `${domain}/login?${params.toString()}`
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
  authTest: () => http.get<AuthTestResponse>('/auth-test'),
}
