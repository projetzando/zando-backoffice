export interface Customer extends Timestamps {
    readonly id?: string
    first_name?: string
    last_name?: string
    phone?: string
    role?: string
    status?: string
    avatar_url?: string | null
    bio?: string
    preferences?: object
    language?: string | null
}
