import type { EmailType, PasswordType, PersonNameType } from '../scalar'
import type { UserRoleType } from '../user/UserRoleType'

/** Roles the public register form may request (see `abricot_frontend_guide.md` §2). */
export type RegisterRoleType = Extract<UserRoleType, 'CUSTOMER' | 'RESTAURANT_ADMIN'>

export interface RegisterRequestType {
  email: EmailType
  password: PasswordType
  name: PersonNameType
  surname: PersonNameType
  role: RegisterRoleType
}
