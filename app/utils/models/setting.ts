export interface Setting extends Timestamps {
    readonly id?: string
    key: string
    value: object | string
    description?: string | null
}