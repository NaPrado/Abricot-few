import type { ApiErrorCodeType } from './ApiErrorCodeType'

export interface ApiErrorResponseType {
  message: string
  code: ApiErrorCodeType | string
  errors: Record<string, unknown>
}
