export interface Category extends Timestamps {
    readonly id?: string
    name: string
    image?: string | null
    is_active: boolean
}