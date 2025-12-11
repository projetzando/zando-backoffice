import type { Conversation, Message } from '~/utils/models/conversation'

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Obtenir toutes les conversations
  async function getAll(filters?: { seller_id?: string, buyer_id?: string }) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      // Récupérer les conversations
      let conversationsQuery = supabase
        .from('conversations')
        .select('*, seller:sellers(*)')
        .order('last_message_at', { ascending: false })

      if (filters?.seller_id) {
        conversationsQuery = conversationsQuery.eq('seller_id', filters.seller_id)
      }
      if (filters?.buyer_id) {
        conversationsQuery = conversationsQuery.eq('buyer_id', filters.buyer_id)
      }

      const { data: conversationsData, error: supaError } = await conversationsQuery

      if (supaError) throw supaError

      // Enrichir avec les données des buyers (profiles)
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: buyerProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, role, avatar_url')
            .eq('id', conv.buyer_id)
            .single()

          return {
            ...conv,
            buyer: buyerProfile,
          }
        }),
      )

      conversations.value = enrichedConversations
      return { success: true, data: enrichedConversations }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
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
        .select('*, seller:sellers(*)')
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
            buyer_id: buyerId,
          })
          .select('*, seller:sellers(*)')
          .single()

        if (createError) throw createError
        conversation = newConversation
      }

      // Enrichir avec le buyer profile si conversation existe
      if (conversation) {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone, role, avatar_url')
          .eq('id', conversation.buyer_id)
          .single()

        conversation.buyer = buyerProfile
      }

      currentConversation.value = conversation
      return { success: true, data: conversation }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
  }

  // Obtenir les messages d'une conversation
  async function getMessages(conversationId: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data: messagesData, error: supaError } = await supabase
        .from('messages')
        .select('*, product:products(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (supaError) throw supaError

      // Enrichir avec les sender profiles
      const enrichedMessages = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, role, avatar_url')
            .eq('id', msg.sender_id)
            .single()

          return {
            ...msg,
            sender: senderProfile,
          }
        }),
      )

      messages.value = enrichedMessages
      return { success: true, data: enrichedMessages }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
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
        .select('*, product:products(*)')
        .single()

      if (supaError) throw supaError

      // Enrichir avec le sender profile
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, role, avatar_url')
        .eq('id', data.sender_id)
        .single()

      const enrichedMessage = {
        ...data,
        sender: senderProfile,
      }

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: message.content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', message.conversation_id)

      // Ajouter le message à la liste
      messages.value.push(enrichedMessage)

      return { success: true, data: enrichedMessage }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
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
        is_read: msg.sender_id === userId ? msg.is_read : true,
      }))

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
    }
    catch (err: any) {
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

  // Obtenir une conversation par ID
  async function getById(id: string) {
    const supabase = useSupabaseClient()
    loading.value = true
    error.value = null

    try {
      const { data: conversationData, error: supaError } = await supabase
        .from('conversations')
        .select('*, seller:sellers(*)')
        .eq('id', id)
        .single()

      if (supaError) throw supaError

      // Enrichir avec le buyer profile
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, role, avatar_url')
        .eq('id', conversationData.buyer_id)
        .single()

      const enrichedConversation = {
        ...conversationData,
        buyer: buyerProfile,
      }

      currentConversation.value = enrichedConversation
      return { success: true, data: enrichedConversation }
    }
    catch (err: any) {
      error.value = err.message
      return { success: false, error: err }
    }
    finally {
      loading.value = false
    }
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
    getById,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
    $reset,
  }
})
