import type { ApiIdType } from '../common'
import type { EmailType, IsoDateTimeType, PersonNameType } from '../scalar'
import type { UserRoleType } from '../user/UserRoleType'

export interface RestaurantAdminType {
  id: ApiIdType
  email: EmailType
  name: PersonNameType
  surname: PersonNameType
  role: UserRoleType
  createdAt: IsoDateTimeType
}
