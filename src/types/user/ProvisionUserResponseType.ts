import type { UserType } from './UserType'

export type ProvisionUserResponseType = UserType & {
  nextStep?: 'restaurant_onboarding'
}
