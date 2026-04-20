import type { EmailType, PasswordType, PersonNameType } from '../scalar'

export interface RegisterRequestType {
  email: EmailType
  password: PasswordType
  name: PersonNameType
  surname: PersonNameType
}
