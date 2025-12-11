export const useDeliveryZoneStore = defineStore(
  'deliveryZone',
  () => {
    // États
    const zones = ref<DeliveryZone[]>([])
    const currentZone = ref<DeliveryZone | null>(null)
    const pricings = ref<DeliveryPricing[]>([])
    const currentPricing = ref<DeliveryPricing | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    // ========================================
    // Actions pour les zones de livraison
    // ========================================

    async function getZones(cityId?: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        let query = supabase
          .from('delivery_zones')
          .select('*, city:cities(id, name)')
          .order('name', { ascending: true })

        if (cityId) {
          query = query.eq('city_id', cityId)
        }

        const { data, error: supaError } = await query

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        zones.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function storeZone(zone: Omit<DeliveryZone, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_zones')
          .insert([zone])
          .select('*, city:cities(id, name)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        zones.value.push(data)
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function updateZone(id: string, zone: Partial<DeliveryZone>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_zones')
          .update(zone)
          .eq('id', id)
          .select('*, city:cities(id, name)')
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        const index = zones.value.findIndex(z => z.id === id)
        if (index !== -1) {
          zones.value[index] = { ...zones.value[index], ...data }
        }

        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function destroyZone(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('delivery_zones').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        zones.value = zones.value.filter(z => z.id !== id)
        return { success: true }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function showZone(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_zones')
          .select('*, city:cities(id, name)')
          .eq('id', id)
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentZone.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    // ========================================
    // Actions pour les tarifs de livraison
    // ========================================

    async function getPricings(cityId?: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        let query = supabase
          .from('delivery_pricings')
          .select(
            `
                    *,
                    city:cities(id, name),
                    from_zone:delivery_zones!delivery_pricings_from_zone_id_fkey(id, name),
                    to_zone:delivery_zones!delivery_pricings_to_zone_id_fkey(id, name)
                `,
          )
          .order('created_at', { ascending: false })

        if (cityId) {
          query = query.eq('city_id', cityId)
        }

        const { data, error: supaError } = await query

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        pricings.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function storePricing(pricing: Omit<DeliveryPricing, 'id' | 'created_at'>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_pricings')
          .insert([pricing])
          .select(
            `
                    *,
                    city:cities(id, name),
                    from_zone:delivery_zones!delivery_pricings_from_zone_id_fkey(id, name),
                    to_zone:delivery_zones!delivery_pricings_to_zone_id_fkey(id, name)
                `,
          )
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        pricings.value.push(data)
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function updatePricing(id: string, pricing: Partial<DeliveryPricing>) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_pricings')
          .update(pricing)
          .eq('id', id)
          .select(
            `
                    *,
                    city:cities(id, name),
                    from_zone:delivery_zones!delivery_pricings_from_zone_id_fkey(id, name),
                    to_zone:delivery_zones!delivery_pricings_to_zone_id_fkey(id, name)
                `,
          )
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        const index = pricings.value.findIndex(p => p.id === id)
        if (index !== -1) {
          pricings.value[index] = { ...pricings.value[index], ...data }
        }

        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function destroyPricing(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase.from('delivery_pricings').delete().eq('id', id)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        pricings.value = pricings.value.filter(p => p.id !== id)
        return { success: true }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function showPricing(id: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_pricings')
          .select(
            `
                    *,
                    city:cities(id, name),
                    from_zone:delivery_zones!delivery_pricings_from_zone_id_fkey(id, name),
                    to_zone:delivery_zones!delivery_pricings_to_zone_id_fkey(id, name)
                `,
          )
          .eq('id', id)
          .single()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        currentPricing.value = data
        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    // ========================================
    // Actions pour lier zones et quartiers
    // ========================================

    async function addAreasToZone(zoneId: string, areaIds: string[]) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const entries = areaIds.map(areaId => ({
          zone_id: zoneId,
          area_id: areaId,
        }))

        const { data, error: supaError } = await supabase
          .from('delivery_zone_areas')
          .insert(entries)
          .select()

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function removeAreaFromZone(zoneId: string, areaId: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { error: supaError } = await supabase
          .from('delivery_zone_areas')
          .delete()
          .eq('zone_id', zoneId)
          .eq('area_id', areaId)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        return { success: true }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    async function getAreasForZone(zoneId: string) {
      const supabase = useSupabaseClient()
      loading.value = true
      error.value = null

      try {
        const { data, error: supaError } = await supabase
          .from('delivery_zone_areas')
          .select('area_id, area:areas(id, name, city_id)')
          .eq('zone_id', zoneId)

        if (supaError) {
          return {
            success: false,
            error: supaError,
            data: null,
          }
        }

        return { success: true, data }
      }
      catch (err: any) {
        error.value = err.message
        return { success: false, error: err.message }
      }
      finally {
        loading.value = false
      }
    }

    function $reset() {
      zones.value = []
      currentZone.value = null
      pricings.value = []
      currentPricing.value = null
      loading.value = false
      error.value = null
    }

    return {
      // États
      zones,
      currentZone,
      pricings,
      currentPricing,
      loading,
      error,

      // Actions - Zones
      getZones,
      storeZone,
      updateZone,
      destroyZone,
      showZone,

      // Actions - Pricings
      getPricings,
      storePricing,
      updatePricing,
      destroyPricing,
      showPricing,

      // Actions - Zone-Area relations
      addAreasToZone,
      removeAreaFromZone,
      getAreasForZone,

      $reset,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
)
