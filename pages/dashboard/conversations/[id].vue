<template>
  <div class="flex flex-col h-[calc(100vh-12rem)]">
    <!-- Header de la conversation -->
    <div
      class="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <UButton
            icon="i-heroicons-arrow-left"
            variant="ghost"
            @click="$router.push('/dashboard/conversations')"
            size="sm"
          />
          <UAvatar
            :src="conversation?.buyer?.avatar_url"
            :alt="`${conversation?.buyer?.first_name} ${conversation?.buyer?.last_name}`"
            size="md"
          />
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ conversation?.buyer?.first_name }}
              {{ conversation?.buyer?.last_name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ conversation?.buyer?.role }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <UBadge
            :color="conversation?.seller?.is_online ? 'green' : 'gray'"
            variant="soft"
            size="sm"
          >
            {{ conversation?.seller?.is_online ? "En ligne" : "Hors ligne" }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Zone des messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      <!-- Skeleton pendant le chargement -->
      <div v-if="conversationStore.loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-start space-x-3">
          <USkeleton class="h-8 w-8 rounded-full" />
          <div class="flex-1">
            <USkeleton class="h-4 w-20 mb-2" />
            <USkeleton class="h-16 w-3/4" />
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-else-if="messages.length > 0">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex items-start space-x-3"
          :class="{
            'flex-row-reverse space-x-reverse': isCurrentUserMessage(message),
          }"
        >
          <UAvatar
            :src="message.sender?.avatar_url"
            :alt="`${message.sender?.first_name} ${message.sender?.last_name}`"
            size="sm"
          />
          <div
            class="max-w-xs lg:max-w-md"
            :class="isCurrentUserMessage(message) ? 'text-right' : 'text-left'"
          >
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ message.sender?.first_name }} {{ message.sender?.last_name }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatMessageTime(message.created_at) }}
              </span>
            </div>

            <!-- Message de produit -->
            <div v-if="message.product" class="mb-2">
              <UCard class="p-3">
                <div class="flex items-center space-x-3">
                  <img
                    :src="message.product.images?.[0]"
                    :alt="message.product.name"
                    class="w-12 h-12 object-cover rounded"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-sm">
                      {{ message.product.name }}
                    </h4>
                    <p class="text-sm text-primary-600">
                      {{ formatPrice(message.product.price) }}
                    </p>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Contenu du message -->
            <div
              class="px-4 py-2 rounded-lg"
              :class="
                isCurrentUserMessage(message)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              "
            >
              <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
            </div>

            <!-- Statut de lecture -->
            <div v-if="isCurrentUserMessage(message)" class="mt-1">
              <span class="text-xs text-gray-500">
                {{ message.is_read ? "Lu" : "Envoyé" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <UIcon
          name="i-heroicons-chat-bubble-left-right"
          class="w-16 h-16 text-gray-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun message
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          Commencez la conversation en envoyant un message
        </p>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div
      class="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
    >
      <form @submit.prevent="sendMessage" class="flex items-end space-x-3">
        <div class="flex-1">
          <UTextarea
            v-model="newMessage"
            placeholder="Tapez votre message..."
            :rows="1"
            autoresize
            :maxrows="4"
            :disabled="conversationStore.loading"
            @keydown.enter.exact.prevent="sendMessage"
          />
        </div>
        <UButton
          type="submit"
          icon="i-heroicons-paper-airplane"
          :loading="conversationStore.loading"
          :disabled="!newMessage.trim()"
          size="lg"
        >
          Envoyer
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const conversationStore = useConversationStore();
const user = useSupabaseUser();

const conversationId = computed(() => route.params.id as string);
const conversation = computed(() => conversationStore.currentConversation);
const messages = computed(() => conversationStore.messages);
const newMessage = ref("");
const messagesContainer = ref<HTMLElement>();

// Charger la conversation et les messages
onMounted(async () => {
  if (conversationId.value) {
    // Charger les détails de la conversation
    await conversationStore.getById(conversationId.value);
    // Charger les messages
    await conversationStore.getMessages(conversationId.value);
    scrollToBottom();

    // Marquer les messages comme lus
    if (user.value?.id) {
      await conversationStore.markMessagesAsRead(
        conversationId.value,
        user.value.id
      );
    }
  }
});

// Watcher pour auto-scroll lors de nouveaux messages
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true }
);

// Fonctions utilitaires
function isCurrentUserMessage(message: any) {
  return message.sender_id === user.value?.id;
}

function formatMessageTime(timestamp: string) {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Vérifier si c'est aujourd'hui
  if (messageDate.toDateString() === today.toDateString()) {
    return messageDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  // Vérifier si c'est hier
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Hier " + messageDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  // Pour les autres jours
  const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    // Cette semaine : afficher le jour
    return messageDate.toLocaleDateString("fr-FR", { 
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Plus ancien : afficher la date complète
    return messageDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !conversationId.value || !user.value?.id)
    return;

  const messageData = {
    conversation_id: conversationId.value,
    sender_id: user.value.id,
    content: newMessage.value.trim(),
  };

  const result = await conversationStore.sendMessage(messageData);

  if (result.success) {
    newMessage.value = "";
    nextTick(() => {
      scrollToBottom();
    });
  }
}

// Configuration de la subscription temps réel
let realtimeSubscription: any = null;

onMounted(() => {
  const supabase = useSupabaseClient();

  // S'abonner aux nouveaux messages de cette conversation
  realtimeSubscription = supabase
    .channel(`conversation:${conversationId.value}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId.value}`,
      },
      async (payload) => {
        // Recharger les messages pour obtenir les données enrichies
        await conversationStore.getMessages(conversationId.value);

        // Marquer comme lu si ce n'est pas un message de l'utilisateur actuel
        if (payload.new.sender_id !== user.value?.id && user.value?.id) {
          await conversationStore.markMessagesAsRead(
            conversationId.value,
            user.value.id
          );
        }
      }
    )
    .subscribe();
});

onUnmounted(() => {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }
});
</script>
