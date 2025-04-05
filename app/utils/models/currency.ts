export interface Currency extends Timestamps {
    readonly id?: string
    code?: string
    symbol?: string
    rate?: number
    is_default?: boolean
}