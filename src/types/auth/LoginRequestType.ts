import type { EmailType, PasswordType } from '../scalar'

export interface LoginRequestType {
  email: EmailType
  password: PasswordType
}
