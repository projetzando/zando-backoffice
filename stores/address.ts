export const useAddressStore = defineStore('address', () => {
  const addresses = ref<Address[]>([])
  const currentAddress = ref<Address | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir les adresses d'un utilisateur
  async function getByUser(userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (supaError) throw supaError

      addresses.value = data || []
      return { success: true, data: data || [] }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Créer une nouvelle adresse
  async function create(address: Omit<Address, 'id' | 'created_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Si c'est une adresse par défaut, désactiver les autres
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', address.user_id)
      }

      const { data, error: supaError } = await supabase
        .from('addresses')
        .insert([address])
        .select()
        .single()

      if (supaError) throw supaError

      addresses.value.unshift(data)
      return { success: true, data }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Mettre à jour une adresse
  async function update(id: string, updates: Partial<Address>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Si on définit cette adresse comme défaut, désactiver les autres
      if (updates.is_default) {
        const currentAddress = addresses.value.find(a => a.id === id)
        if (currentAddress) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', currentAddress.user_id)
            .neq('id', id)
        }
      }

      const { data, error: supaError } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supaError) throw supaError

      const index = addresses.value.findIndex(a => a.id === id)
      if (index !== -1) {
        addresses.value[index] = data
      }

      if (currentAddress.value?.id === id) {
        currentAddress.value = data
      }

      return { success: true, data }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Supprimer une adresse
  async function remove(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase.from('addresses').delete().eq('id', id)

      if (supaError) throw supaError

      addresses.value = addresses.value.filter(a => a.id !== id)
      if (currentAddress.value?.id === id) {
        currentAddress.value = null
      }

      return { success: true }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Définir comme adresse par défaut
  async function setAsDefault(id: string, userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Désactiver toutes les adresses par défaut de l'utilisateur
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)

      // Définir la nouvelle adresse par défaut
      const { data, error: supaError } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single()

      if (supaError) throw supaError

      // Mettre à jour la liste locale
      addresses.value = addresses.value.map(a => ({
        ...a,
        is_default: a.id === id,
      }))

      return { success: true, data }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Obtenir l'adresse par défaut
  const defaultAddress = computed(() => {
    return addresses.value.find(a => a.is_default) || null
  })

  function $reset() {
    addresses.value = []
    currentAddress.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    addresses: readonly(addresses),
    currentAddress: readonly(currentAddress),
    loading: readonly(loading),
    error: readonly(error),

    // Getters
    defaultAddress,

    // Actions
    getByUser,
    create,
    update,
    remove,
    setAsDefault,
    $reset,
  }
})
