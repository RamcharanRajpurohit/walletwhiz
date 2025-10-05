export interface ApiError {
  message: string
  status?: number
  code?: string
}

export interface QueryParams {
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: string
}