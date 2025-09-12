export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir toutes les conversations
  async function getAll(filters?: {
    seller_id?: string
    buyer_id?: string
  }) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          seller:sellers(*),
          buyer:profiles(*)
        `)
        .order('last_message_at', { ascending: false })

      if (filters?.seller_id) {
        query = query.eq('seller_id', filters.seller_id)
      }
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id)
      }

      const { data, error: supaError } = await query

      if (supaError) throw supaError

      conversations.value = data || []
      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Obtenir ou créer une conversation
  async function getOrCreateConversation(sellerId: string, buyerId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Chercher conversation existante
      let { data: conversation, error: findError } = await supabase
        .from('conversations')
        .select(`
          *,
          seller:sellers(*),
          buyer:profiles(*)
        `)
        .eq('seller_id', sellerId)
        .eq('buyer_id', buyerId)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        throw findError
      }

      if (!conversation) {
        // Créer nouvelle conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            seller_id: sellerId,
            buyer_id: buyerId
          })
          .select(`
            *,
            seller:sellers(*),
            buyer:profiles(*)
          `)
          .single()

        if (createError) throw createError
        conversation = newConversation
      }

      currentConversation.value = conversation
      return { success: true, data: conversation }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Obtenir les messages d'une conversation
  async function getMessages(conversationId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*),
          product:products(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (supaError) throw supaError

      messages.value = data || []
      return { success: true, data: data || [] }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Envoyer un message
  async function sendMessage(message: Omit<Message, 'id' | 'created_at'>) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data, error: supaError } = await supabase
        .from('messages')
        .insert([message])
        .select(`
          *,
          sender:profiles(*),
          product:products(*)
        `)
        .single()

      if (supaError) throw supaError

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: message.content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', message.conversation_id)

      // Ajouter le message à la liste
      messages.value.push(data)

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Marquer les messages comme lus
  async function markMessagesAsRead(conversationId: string, userId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { error: supaError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (supaError) throw supaError

      // Mettre à jour les messages locaux
      messages.value = messages.value.map(msg => ({
        ...msg,
        is_read: msg.sender_id === userId ? msg.is_read : true
      }))

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Compter les messages non lus
  async function getUnreadCount(userId: string) {
    const supabase = useSupabaseClient()

    try {
      const { count, error: supaError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (supaError) throw supaError

      return { success: true, count: count || 0 }
    } catch (err: any) {
      return { success: false, error: err }
    }
  }

  function $reset() {
    conversations.value = []
    currentConversation.value = null
    messages.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    conversations: readonly(conversations),
    currentConversation: readonly(currentConversation),
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    getAll,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
    $reset
  }
})