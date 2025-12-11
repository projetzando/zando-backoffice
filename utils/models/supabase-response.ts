export interface SupabaseResponse<T> {
  data: T | null
  error: any | null
  success: boolean
}
