# Abricot API Types Checklist

Source: .mcp/abricot_frontend_guide.md
Purpose: implementation and validation checklist for frontend types.

Note: Regex entries are practical frontend validation patterns that match the guide rules.

## Core Scalar Types and Validators
- [x] ApiIdType: string UUID v7. Regex: ^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
- [x] EmailType: string, max 255. Regex: ^[^\s@]+@[^\s@]+\.[^\s@]+$
- [x] PasswordType: string, min 8, max 128
- [x] PersonNameType: string for user name/surname, max 100, letters/accents/n/space/hyphen only. Regex: ^[\p{L}]+(?:[ -][\p{L}]+)*$ (u flag)
- [x] RestaurantNameType: string, min 1, max 150
- [x] AddressType: string, min 1, max 255
- [x] ShortLabelType: string, max 50
- [x] LongTextType: string, max 2000
- [x] ReservationNoteType: string, max 1000
- [x] PromotionTitleType: string, max 200
- [x] GuestNameType: string, max 150
- [x] PhoneType: string, min 7, allows +, spaces, parentheses, hyphen. Regex: ^\+?[0-9()\-\s]{7,}$
- [x] IsoDateType: string YYYY-MM-DD. Regex: ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
- [x] IsoTimeType: string HH:MM (24h). Regex: ^([01]\d|2[0-3]):[0-5]\d$
- [x] IsoDateTimeType: ISO 8601 with timezone. Regex: ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$
- [x] MoneyAmountType: decimal string with 2 digits. Regex: ^\d+\.\d{2}$
- [x] PositiveIntType: integer >= 1
- [x] NonNegativeIntType: integer >= 0
- [x] PercentageType: decimal string in range 0..100 for promotion percentage
- [x] PageType: integer >= 1, default 1
- [x] PerPageType: integer 1..100, default 20
- [x] CountryIsoCodeType: uppercase 2 letters. Regex: ^[A-Z]{2}$
- [x] ImageMimeType: one of image/jpeg, image/png, image/webp
- [x] ImageMaxSizeType: max 5 MB

## Enum Types
- [x] UserRoleType: CUSTOMER | RESTAURANT_ADMIN | SUPER_ADMIN
- [x] ReservationSourceType: ONLINE | PHONE | EVENT
- [x] ReservationStatusType: CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
- [x] OrderStatusType: PENDING | CONFIRMED | IN_PREPARATION | READY | COMPLETED | CANCELLED
- [x] DiscountTypeType: PERCENTAGE | FIXED_AMOUNT | FREE_ITEM
- [x] ApiErrorCodeType: VALIDATION_ERROR | VALUE_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_ERROR

## Generic API Types
- [x] ApiErrorResponseType: { message: string; code: ApiErrorCodeType; errors: Record<string, unknown> | {} }
- [x] PaginationQueryType: { page?: PageType; per_page?: PerPageType }
- [x] PaginatedResponseType<T>: { data: T[]; total: NonNegativeIntType; page: PageType; perPage: PerPageType }
- [x] QueryPrimitiveType: string | number | boolean | null | undefined
- [x] QueryValueType: QueryPrimitiveType | QueryPrimitiveType[]
- [x] QueryParamsType: Record<string, QueryValueType>

## Auth Types
- [x] LoginRequestType: { email: EmailType; password: PasswordType }
- [x] RegisterRequestType: { email: EmailType; password: PasswordType; name: PersonNameType; surname: PersonNameType }
- [x] AuthResponseType: { accessToken: string; refreshToken: string; user: UserType }
- [x] RefreshTokenResponseType: { accessToken: string }
- [x] AuthorizationHeaderType: Bearer token format. Regex: ^Bearer\s+\S+$

## Lookup Types
- [x] CuisineType: { id: ApiIdType; slug: string; label: string }
- [x] PriceRangeType: { id: ApiIdType; slug: string; label: string; description: string; sortOrder: NonNegativeIntType }
- [x] CountryType: { id: ApiIdType; name: string; isoCode: CountryIsoCodeType }
- [x] ProvinceType: { id: ApiIdType; name: string; countryId: ApiIdType }
- [x] CityType: { id: ApiIdType; name: string; provinceId: ApiIdType }
- [x] NeighbourhoodType: { id: ApiIdType; name: string; cityId: ApiIdType }

## Restaurant Types
- [x] RestaurantListQueryType: { name?: string; country_id?: ApiIdType; province_id?: ApiIdType; city_id?: ApiIdType; neighbourhood_id?: ApiIdType; price_range_id?: ApiIdType; cuisine_type_id?: ApiIdType | ApiIdType[]; page?: PageType; per_page?: PerPageType }
- [x] RestaurantCreateRequestType: { name: RestaurantNameType; address: AddressType; cityId: ApiIdType; neighbourhoodId?: ApiIdType; priceRangeId?: ApiIdType; cuisineTypeIds?: ApiIdType[]; phone: PhoneType; email?: EmailType; description?: LongTextType; allowTableJoining?: boolean; defaultSlotDurationMinutes?: PositiveIntType }
- [x] RestaurantUpdateRequestType: same fields/constraints as RestaurantCreateRequestType, full PUT body
- [x] RestaurantPhotoUploadResponseType: { photoUrl: string }
- [x] RestaurantType: includes ApiIdType ids, nested location objects, priceRange, cuisineTypes, createdAt as IsoDateTimeType, defaultSlotDurationMinutes as PositiveIntType

## Table Types
- [x] TableType: { id: ApiIdType; restaurantId: ApiIdType; number: PositiveIntType; capacity: PositiveIntType; name?: string | null; isJoinable: boolean; isActive: boolean }
- [x] CreateTableRequestType: { number: PositiveIntType; capacity: PositiveIntType; name?: ShortLabelType; isJoinable?: boolean; isActive?: boolean }
- [x] UpdateTableRequestType: same as CreateTableRequestType but full PUT requires all fields
- [x] BulkCreateTablesGroupType: { quantity: PositiveIntType; capacity: PositiveIntType; isJoinable?: boolean } where quantity min 1
- [x] BulkCreateTablesRequestType: { groups: BulkCreateTablesGroupType[] } where groups length >= 1
- [x] BulkCreateTablesResponseType: { created: PositiveIntType; tables: TableType[] }

## Business Hours Types
- [x] BusinessHourType: { id: ApiIdType; dayOfWeek: 0|1|2|3|4|5|6; dayName: string; opensAt: IsoTimeType | null; closesAt: IsoTimeType | null; isClosed: boolean }
- [x] BusinessHourInputType: { dayOfWeek: 0|1|2|3|4|5|6; opensAt?: IsoTimeType | null; closesAt?: IsoTimeType | null; isClosed: boolean }
- [x] UpdateBusinessHoursRequestType: BusinessHourInputType[] length 7

## Availability Types
- [x] AvailabilityQueryType: { date: IsoDateType; party_size: PositiveIntType } and date must be today or future
- [x] TableAssignmentType: { tableIds: ApiIdType[]; tableNumbers: PositiveIntType[]; totalCapacity: PositiveIntType; isJoined: boolean }
- [x] AvailabilitySlotType: { timeSlot: IsoTimeType; isAvailable: boolean; tableAssignment: TableAssignmentType | null }
- [x] AvailabilityResponseType: { date: IsoDateType; partySize: PositiveIntType; allowTableJoining: boolean; slots: AvailabilitySlotType[] }

## Reservation Types
- [x] ReservationTableType: { tableId: ApiIdType; tableNumber: PositiveIntType; capacity: PositiveIntType }
- [x] ReservationType: includes id fields as ApiIdType, source as ReservationSourceType, status as ReservationStatusType, date/time formats, partySize >= 1, notes optional, confirmationCode string, tables ReservationTableType[]
- [x] CreateReservationRequestType: { partySize: PositiveIntType; date: IsoDateType; timeSlot: IsoTimeType; notes?: ReservationNoteType } and date must be future
- [x] CreateAdminReservationRequestType: { partySize: PositiveIntType; date: IsoDateType; timeSlot: IsoTimeType; source: PHONE|EVENT; guestName?: GuestNameType | null; guestPhone?: PhoneType; guestEmail?: EmailType; userId?: ApiIdType | null; notes?: string }
- [x] CreateAdminReservationRequestType cross-field rule: exactly one of guestName (when userId is null) or userId must be non-null
- [x] RestaurantReservationsQueryType: { date_from?: IsoDateType; date_to?: IsoDateType; status?: ReservationStatusType; source?: ReservationSourceType; page?: PageType; per_page?: PerPageType }
- [x] RestaurantReservationsResponseType: PaginatedResponseType<ReservationType>
- [x] ReservationLookupQueryType: { code: string } (exact pattern not specified in guide)
- [x] CancelReservationRequestType: { reason?: string }
- [x] ReassignReservationTablesRequestType: { tableIds: ApiIdType[] } with min 1

## Menu Types
- [x] MenuType: { id: ApiIdType; restaurantId: ApiIdType; name: string; isActive: boolean; createdAt: IsoDateTimeType }
- [x] CreateMenuRequestType: { name: string } with max 150
- [x] UpdateMenuRequestType: { name: string; isActive: boolean } (name max 150)
- [x] MenuCategoryType: { id: ApiIdType; menuId: ApiIdType; name: string; displayOrder: NonNegativeIntType; isActive: boolean }
- [x] CreateMenuCategoryRequestType: { name: string; displayOrder?: NonNegativeIntType; isActive?: boolean } with name max 100 and defaults displayOrder=0, isActive=true
- [x] UpdateMenuCategoryRequestType: { name: string; displayOrder: NonNegativeIntType; isActive: boolean } with name max 100
- [x] ReorderMenuCategoriesRequestType: { orderedIds: ApiIdType[] }
- [x] MenuItemType: { id: ApiIdType; categoryId: ApiIdType; name: string; description?: string; price: MoneyAmountType; photoUrl?: string | null; isAvailable: boolean; createdAt: IsoDateTimeType }
- [x] CreateMenuItemRequestType: { name: string; description?: string; price: MoneyAmountType; isAvailable?: boolean } with name max 150, description max 2000, default isAvailable=true
- [x] UpdateMenuItemRequestType: same constraints as CreateMenuItemRequestType but full PUT body
- [x] UpdateMenuItemAvailabilityRequestType: { isAvailable: boolean }
- [x] MenuCategoryWithItemsType: MenuCategoryType + { items: MenuItemType[] }
- [x] MenuDetailType: MenuType + { categories: MenuCategoryWithItemsType[] }
- [x] MenuItemPhotoUploadResponseType: { photoUrl: string }

## Order Types
- [x] OrderItemType: { id: ApiIdType; menuItemId: ApiIdType; menuItemName: string; quantity: PositiveIntType; unitPrice: MoneyAmountType; notes?: string | null }
- [x] OrderType: { id: ApiIdType; restaurantId: ApiIdType; restaurantName: string; userId: ApiIdType; status: OrderStatusType; totalAmount: MoneyAmountType; notes?: string; estimatedReadyAt?: IsoDateTimeType | null; createdAt: IsoDateTimeType; items: OrderItemType[] }
- [x] CreateOrderRequestItemType: { menuItemId: ApiIdType; quantity: PositiveIntType; notes?: string | null }
- [x] CreateOrderRequestType: { items: CreateOrderRequestItemType[]; notes?: string } with items length >= 1
- [x] RestaurantOrdersQueryType: { status?: OrderStatusType; page?: PageType; per_page?: PerPageType }
- [x] RestaurantOrdersResponseType: PaginatedResponseType<OrderType>
- [x] UpdateOrderStatusRequestType: { status: OrderStatusType; estimatedReadyAt?: IsoDateTimeType }
- [x] UpdateOrderStatusRequestType business rule: enforce valid transitions only (PENDING->CONFIRMED/CANCELLED, CONFIRMED->IN_PREPARATION/CANCELLED, IN_PREPARATION->READY, READY->COMPLETED)
- [x] CancelOrderRequestType: empty body

## Promotion Types
- [x] PromotionItemType: menu item shape in promotion payload (id/categoryId/name/price)
- [x] PromotionType: { id: ApiIdType; restaurantId: ApiIdType; restaurantName: string; title: PromotionTitleType; description?: LongTextType; discountType: DiscountTypeType; discountValue: MoneyAmountType; startDate: IsoDateType; endDate: IsoDateType; isActive: boolean; notifyUsers: boolean; createdAt: IsoDateTimeType; items: PromotionItemType[] }
- [x] PromotionType date rule: endDate must be >= startDate
- [x] PromotionType discount rule: if discountType=PERCENTAGE then discountValue in 0..100
- [x] PromotionFeedQueryType: { page?: PageType; per_page?: PerPageType }
- [x] PromotionFeedResponseType: PaginatedResponseType<PromotionType>
- [x] CreatePromotionRequestType: { title: PromotionTitleType; description?: LongTextType; discountType: DiscountTypeType; discountValue: MoneyAmountType; startDate: IsoDateType; endDate: IsoDateType; notifyUsers?: boolean; menuItemIds?: ApiIdType[] }
- [x] UpdatePromotionRequestType: same constraints as CreatePromotionRequestType

## User and Notification Types
- [x] UserType: { id: ApiIdType; email: EmailType; name: PersonNameType; surname: PersonNameType; role: UserRoleType; createdAt: IsoDateTimeType }
- [x] UserProfileType: UserType
- [x] UserProfileResponseType: UserType
- [x] UpdateUserMeRequestType: { name: PersonNameType; surname: PersonNameType }
- [x] UpdatePasswordRequestType: { currentPassword: string; newPassword: PasswordType }
- [x] UpdatePasswordResponseType: { message: string }
- [x] MyRestaurantsResponseType: RestaurantType[]
- [x] NotificationPreferenceType: { restaurantId: ApiIdType; restaurantName: string; receivePromotions: boolean; receiveOrderUpdates: boolean; receiveReservationReminders: boolean }
- [x] UpdateNotificationPreferenceRequestType: { receivePromotions: boolean; receiveOrderUpdates: boolean; receiveReservationReminders: boolean } (all required)

## Analytics Types
- [x] AnalyticsQueryType: { start: IsoDateType; end: IsoDateType; limit?: PositiveIntType } where limit default is 10 for popular-items
- [x] AnalyticsPeriodType: { start: IsoDateType; end: IsoDateType }
- [x] OccupancyByDayPointType: { date: IsoDateType; reservations: NonNegativeIntType; covers: NonNegativeIntType; occupancyRate: number } where occupancyRate in [0,1]
- [x] OccupancyAnalyticsResponseType: { restaurantId: ApiIdType; period: AnalyticsPeriodType; totalReservations: NonNegativeIntType; totalCovers: NonNegativeIntType; occupancyByDay: OccupancyByDayPointType[] }
- [x] OrdersByStatusPointType: { status: OrderStatusType; count: NonNegativeIntType }
- [x] RevenueByDayPointType: { date: IsoDateType; revenue: MoneyAmountType; orders: NonNegativeIntType }
- [x] OrdersAnalyticsResponseType: { restaurantId: ApiIdType; period: AnalyticsPeriodType; totalOrders: NonNegativeIntType; totalRevenue: MoneyAmountType; averageOrderValue: MoneyAmountType; ordersByStatus: OrdersByStatusPointType[]; revenueByDay: RevenueByDayPointType[] }
- [x] PopularItemPointType: { menuItemId: ApiIdType; name: string; quantitySold: NonNegativeIntType; revenue: MoneyAmountType; rank: PositiveIntType }
- [x] PopularItemsAnalyticsResponseType: { restaurantId: ApiIdType; period: AnalyticsPeriodType; items: PopularItemPointType[] }
- [x] PromotionAnalyticsPointType: { promotionId: ApiIdType; title: string; ordersWithPromotion: NonNegativeIntType; revenueImpact: MoneyAmountType; discountGiven: MoneyAmountType }
- [x] PromotionsAnalyticsResponseType: { restaurantId: ApiIdType; period: AnalyticsPeriodType; promotions: PromotionAnalyticsPointType[] }
- [x] PeakHourCountPointType: { hour: number; count: NonNegativeIntType } where hour is 0..23
- [x] PeakHoursAnalyticsResponseType: { restaurantId: ApiIdType; period: AnalyticsPeriodType; reservationsByHour: PeakHourCountPointType[]; ordersByHour: PeakHourCountPointType[] }

## Cross-Field and Business Validation Rules
- [ ] Refresh endpoint must receive refresh token, never access token
- [ ] Protected endpoints must receive access token in Authorization header
- [ ] Business hours: if isClosed=true then opensAt and closesAt must be null
- [ ] Availability query date cannot be past date
- [ ] Reservation/admin creation must fail if no table capacity available for partySize
- [ ] Reassign tables must preserve slot availability and capacity >= partySize
- [ ] Orders cancel by customer only valid in PENDING
- [ ] Promotions with empty or omitted menuItemIds apply to full menu
- [ ] Restaurant photo and menu item photo upload must enforce mime whitelist and max size
