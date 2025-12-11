export interface Area extends Timestamps {
  readonly id?: string
  city_id?: string
  name: string
  city?: {
    id: string
    name: string
  }
}
