/** Integer 1–5. */
export type ReviewScoreType = 1 | 2 | 3 | 4 | 5

export interface RestaurantMyReviewPutRequestType {
  score: ReviewScoreType
}
