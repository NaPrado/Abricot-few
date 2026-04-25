import type { ApiIdType } from '../common'
import type { IsoDateTimeType } from '../scalar'
import type { ReviewScoreType } from './RestaurantMyReviewPutRequestType'

export interface RestaurantMyReviewResponseType {
  restaurantId: ApiIdType
  userId: ApiIdType
  score: ReviewScoreType
  createdAt: IsoDateTimeType
  updatedAt: IsoDateTimeType
}
