import type { ApiIdType } from '../common'
import type { EmailType, IsoDateTimeType, PersonNameType } from '../scalar'
import type { UserRoleType } from './UserRoleType'

export interface UserType {
  id: ApiIdType
  email: EmailType
  name: PersonNameType
  surname: PersonNameType
  role: UserRoleType
  createdAt: IsoDateTimeType
  cognitoSub?: string | null
}
