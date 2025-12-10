export interface DeliveryZone extends Timestamps {
    readonly id?: string
    city_id?: string
    name: string
    description?: string
    city?: {
        id: string
        name: string
    }
    areas?: Area[]
}

export interface DeliveryZoneArea {
    zone_id: string
    area_id: string
}

export interface DeliveryPricing extends Timestamps {
    readonly id?: string
    city_id?: string
    from_zone_id?: string
    to_zone_id?: string
    price: number
    city?: {
        id: string
        name: string
    }
    from_zone?: {
        id: string
        name: string
    }
    to_zone?: {
        id: string
        name: string
    }
}
