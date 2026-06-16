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
  /**
   * SHARED topic ARN — identical for every user (one email topic backend-wide).
   * Do NOT use as a per-user identifier, cache key, or uniqueness check.
   * Email-confirmation state lives in `snsSubscriptionStatus` only.
   */
  snsTopicArn?: string | null
  /** Per-user subscription ARN. Informational only; gate the UI on the status below. */
  snsSubscriptionArn?: string | null
  /** Source of truth for the "confirm your email" gate: PENDING_CONFIRMATION | CONFIRMED | FAILED. */
  snsSubscriptionStatus?: UserSnsSubscriptionStatusType | null
  snsSubscriptionRequestedAt?: IsoDateTimeType | null
  createdAt: IsoDateTimeType
  cognitoSub?: string | null
}
