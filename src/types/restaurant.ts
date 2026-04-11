export interface Restaurant {
  id: number
  name: string
  address: string
  phone: string
  email: string | null
  description: string | null
  photoUrl: string | null
  createdAt: string
}

export interface RestaurantCreateRequest {
  name: string
  address: string
  phone: string
  email?: string
  description?: string
}

// Same shape as Create — alias avoids duplicating the interface
export type RestaurantUpdateRequest = RestaurantCreateRequest
