import type { UserType } from '../user'

export interface AuthResponseType {
  accessToken: string
  refreshToken: string
  user: UserType
}
