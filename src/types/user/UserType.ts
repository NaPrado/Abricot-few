import type { ApiIdType } from '../common'
import type { EmailType, IsoDateTimeType, PersonNameType } from '../scalar'
import type { UserRoleType } from './UserRoleType'
import type { UserSnsSubscriptionStatusType } from './UserSnsSubscriptionStatusType'

export interface UserType {
  id: ApiIdType
  email: EmailType
  name: PersonNameType
  surname: PersonNameType
  role: UserRoleType
  snsTopicArn?: string | null
  snsSubscriptionArn?: string | null
  snsSubscriptionStatus?: UserSnsSubscriptionStatusType | null
  snsSubscriptionRequestedAt?: IsoDateTimeType | null
  createdAt: IsoDateTimeType
  cognitoSub?: string | null
}
