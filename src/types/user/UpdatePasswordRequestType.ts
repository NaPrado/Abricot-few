import type { PasswordType } from '../scalar'

export interface UpdatePasswordRequestType {
  currentPassword: string
  newPassword: PasswordType
}
