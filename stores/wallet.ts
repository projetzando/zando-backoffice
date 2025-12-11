export const useWalletStore = defineStore('wallet', () => {
  const systemWallet = ref<Wallet | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Récupérer le wallet système
  async function getSystemWallet() {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('wallets')
        .select('*')
        .eq('is_system', true)
        .single()

      if (supaError) throw supaError

      systemWallet.value = data
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

  // Récupérer le wallet d'un vendeur
  async function getSellerWallet(sellerId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('wallets')
        .select('*')
        .eq('owner_type', 'seller')
        .eq('owner_id', sellerId)
        .single()

      if (supaError) throw supaError

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

  // Récupérer les transactions d'un wallet
  async function getWalletTransactions(walletId: string, limit = 10) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (supaError) throw supaError

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

  function $reset() {
    systemWallet.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    systemWallet: readonly(systemWallet),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    getSystemWallet,
    getSellerWallet,
    getWalletTransactions,
    $reset,
  }
})
