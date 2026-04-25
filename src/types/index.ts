export * from './scalar'
export * from './common'
export * from './auth'
export * from './user'
export * from './lookup'
export * from './restaurant'
export * from './table'
export * from './businessHours'
export * from './availability'
export * from './reservation'
export * from './menu'
export * from './order'
export * from './promotion'
export * from './notificationPreference'
export * from './analytics'

import type { AnalyticsPeriodType, AnalyticsQueryType, OccupancyAnalyticsResponseType, OccupancyByDayPointType, OrdersAnalyticsResponseType, OrdersByStatusPointType, PeakHourCountPointType, PeakHoursAnalyticsResponseType, PopularItemPointType, PopularItemsAnalyticsResponseType, PromotionAnalyticsPointType, PromotionsAnalyticsResponseType, RevenueByDayPointType } from './analytics'
import type { AuthResponseType, LoginRequestType, RefreshTokenResponseType, RegisterRequestType } from './auth'
import type { AvailabilityQueryType, AvailabilityResponseType, AvailabilitySlotType, TableAssignmentType } from './availability'
import type { BusinessHourInputType, BusinessHourType, UpdateBusinessHoursRequestType } from './businessHours'
import type { ApiErrorResponseType, ApiIdType, PaginatedResponseType, PaginationQueryType, QueryParamsType, QueryPrimitiveType, QueryValueType } from './common'
import type { CityType, CountryType, CuisineType, NeighbourhoodType, PriceRangeType, ProvinceType } from './lookup'
import type { CreateMenuCategoryRequestType, CreateMenuItemRequestType, CreateMenuRequestType, MenuCategoryType, MenuCategoryWithItemsType, MenuDetailType, MenuItemPhotoUploadResponseType, MenuItemType, MenuType, ReorderMenuCategoriesRequestType, UpdateMenuCategoryRequestType, UpdateMenuItemAvailabilityRequestType, UpdateMenuItemRequestType, UpdateMenuRequestType } from './menu'
import type { NotificationPreferenceType, UpdateNotificationPreferenceRequestType } from './notificationPreference'
import type { CancelOrderRequestType, CreateOrderRequestItemType, CreateOrderRequestType, OrderItemType, OrderStatusType, OrderType, RestaurantOrderPatchRequestType, RestaurantOrdersQueryType, RestaurantOrdersResponseType, UpdateOrderStatusRequestType } from './order'
import type { CreatePromotionRequestType, DiscountTypeType, PromotionFeedQueryType, PromotionFeedResponseType, PromotionItemType, PromotionListResponseType, PromotionType } from './promotion'
import type { CancelReservationRequestType, CreateAdminReservationRequestType, CreateReservationRequestType, ReassignReservationTablesRequestType, ReservationLookupQueryType, ReservationSourceType, ReservationStatusType, ReservationTableType, ReservationType, RestaurantReservationsQueryType, RestaurantReservationsResponseType } from './reservation'
import type { RestaurantCityType, RestaurantCountryType, RestaurantCreateRequestType, RestaurantCuisineTypeType, RestaurantListQueryType, RestaurantListResponseType, RestaurantMyReviewPutRequestType, RestaurantMyReviewResponseType, RestaurantNeighbourhoodType, RestaurantPhotoUploadResponseType, RestaurantPriceRangeType, RestaurantProvinceType, RestaurantType, RestaurantUpdateRequestType, ReviewScoreType } from './restaurant'
import type { BulkCreateTablesGroupType, BulkCreateTablesRequestType, BulkCreateTablesResponseType, CreateTableRequestType, TableType, UpdateTableRequestType } from './table'
import type { MyRestaurantsResponseType, UpdatePasswordRequestType, UpdatePasswordResponseType, UpdateUserMeRequestType, UserProfileResponseType, UserProfileType, UserRoleType, UserType } from './user'

export type AnalyticsQuery = AnalyticsQueryType
export type AnalyticsPeriod = AnalyticsPeriodType
export type OccupancyByDayPoint = OccupancyByDayPointType
export type OccupancyAnalyticsResponse = OccupancyAnalyticsResponseType
export type OrdersByStatusPoint = OrdersByStatusPointType
export type RevenueByDayPoint = RevenueByDayPointType
export type OrdersAnalyticsResponse = OrdersAnalyticsResponseType
export type PopularItemPoint = PopularItemPointType
export type PopularItemsAnalyticsResponse = PopularItemsAnalyticsResponseType
export type PromotionAnalyticsPoint = PromotionAnalyticsPointType
export type PromotionsAnalyticsResponse = PromotionsAnalyticsResponseType
export type PeakHourCountPoint = PeakHourCountPointType
export type PeakHoursAnalyticsResponse = PeakHoursAnalyticsResponseType
export type UserRole = UserRoleType
export type User = UserType
export type UserProfile = UserProfileType
export type AuthResponse = AuthResponseType
export type RefreshTokenResponse = RefreshTokenResponseType
export type LoginRequest = LoginRequestType
export type RegisterRequest = RegisterRequestType
export type AvailabilityQuery = AvailabilityQueryType
export type TableAssignment = TableAssignmentType
export type AvailabilitySlot = AvailabilitySlotType
export type AvailabilityResponse = AvailabilityResponseType
export type BusinessHour = BusinessHourType
export type BusinessHourInput = BusinessHourInputType
export type UpdateBusinessHoursRequest = UpdateBusinessHoursRequestType
export type ApiId = ApiIdType
export type QueryPrimitive = QueryPrimitiveType
export type QueryValue = QueryValueType
export type QueryParams = QueryParamsType
export type ApiErrorResponse = ApiErrorResponseType
export type PaginationQuery = PaginationQueryType
export type PaginatedResponse<T> = PaginatedResponseType<T>
export type Cuisine = CuisineType
export type PriceRange = PriceRangeType
export type Country = CountryType
export type Province = ProvinceType
export type City = CityType
export type Neighbourhood = NeighbourhoodType
export type Menu = MenuType
export type MenuCategory = MenuCategoryType
export type MenuItem = MenuItemType
export type MenuCategoryWithItems = MenuCategoryWithItemsType
export type MenuDetail = MenuDetailType
export type CreateMenuRequest = CreateMenuRequestType
export type UpdateMenuRequest = UpdateMenuRequestType
export type CreateMenuCategoryRequest = CreateMenuCategoryRequestType
export type UpdateMenuCategoryRequest = UpdateMenuCategoryRequestType
export type ReorderMenuCategoriesRequest = ReorderMenuCategoriesRequestType
export type CreateMenuItemRequest = CreateMenuItemRequestType
export type UpdateMenuItemRequest = UpdateMenuItemRequestType
export type UpdateMenuItemAvailabilityRequest = UpdateMenuItemAvailabilityRequestType
export type MenuItemPhotoUploadResponse = MenuItemPhotoUploadResponseType
export type NotificationPreference = NotificationPreferenceType
export type UpdateNotificationPreferenceRequest = UpdateNotificationPreferenceRequestType
export type OrderStatus = OrderStatusType
export type OrderItem = OrderItemType
export type Order = OrderType
export type CreateOrderRequestItem = CreateOrderRequestItemType
export type CreateOrderRequest = CreateOrderRequestType
export type RestaurantOrdersQuery = RestaurantOrdersQueryType
export type RestaurantOrdersResponse = RestaurantOrdersResponseType
export type UpdateOrderStatusRequest = UpdateOrderStatusRequestType
export type RestaurantOrderPatchRequest = RestaurantOrderPatchRequestType
export type CancelOrderRequest = CancelOrderRequestType
export type DiscountType = DiscountTypeType
export type PromotionItem = PromotionItemType
export type Promotion = PromotionType
export type PromotionFeedQuery = PromotionFeedQueryType
export type PromotionFeedResponse = PromotionFeedResponseType
export type CreatePromotionRequest = CreatePromotionRequestType
export type PromotionListResponse = PromotionListResponseType
export type ReservationSource = ReservationSourceType
export type ReservationStatus = ReservationStatusType
export type ReservationTable = ReservationTableType
export type Reservation = ReservationType
export type CreateReservationRequest = CreateReservationRequestType
export type CreateAdminReservationRequest = CreateAdminReservationRequestType
export type RestaurantReservationsQuery = RestaurantReservationsQueryType
export type RestaurantReservationsResponse = RestaurantReservationsResponseType
export type ReservationLookupQuery = ReservationLookupQueryType
export type CancelReservationRequest = CancelReservationRequestType
export type ReassignReservationTablesRequest = ReassignReservationTablesRequestType
export type RestaurantCountry = RestaurantCountryType
export type RestaurantProvince = RestaurantProvinceType
export type RestaurantCity = RestaurantCityType
export type RestaurantNeighbourhood = RestaurantNeighbourhoodType
export type RestaurantPriceRange = RestaurantPriceRangeType
export type RestaurantCuisineType = RestaurantCuisineTypeType
export type Restaurant = RestaurantType
export type RestaurantListQuery = RestaurantListQueryType
export type RestaurantListResponse = RestaurantListResponseType
export type RestaurantCreateRequest = RestaurantCreateRequestType
export type RestaurantUpdateRequest = RestaurantUpdateRequestType
export type RestaurantPhotoUploadResponse = RestaurantPhotoUploadResponseType
export type ReviewScore = ReviewScoreType
export type RestaurantMyReviewPutRequest = RestaurantMyReviewPutRequestType
export type RestaurantMyReviewResponse = RestaurantMyReviewResponseType
export type Table = TableType
export type CreateTableRequest = CreateTableRequestType
export type UpdateTableRequest = UpdateTableRequestType
export type BulkCreateTablesGroup = BulkCreateTablesGroupType
export type BulkCreateTablesRequest = BulkCreateTablesRequestType
export type BulkCreateTablesResponse = BulkCreateTablesResponseType
export type UserProfileResponse = UserProfileResponseType
export type UpdateUserMeRequest = UpdateUserMeRequestType
export type UpdatePasswordRequest = UpdatePasswordRequestType
export type UpdatePasswordResponse = UpdatePasswordResponseType
export type MyRestaurantsResponse = MyRestaurantsResponseType
