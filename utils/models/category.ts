export interface Category extends Timestamps {
    readonly id?: string
    parent_id?: string | null
    name: string
    slug: string
    description?: string | null
    level: number
    is_active: boolean
}