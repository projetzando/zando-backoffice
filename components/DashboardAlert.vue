<template>
  <UCard :ui="cardStyles">
    <div class="flex items-start gap-3">
      <!-- Icône -->
      <div :class="iconWrapperClass">
        <UIcon :name="iconName" :class="iconClass" />
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 :class="titleClass">{{ alert.title }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ alert.message }}</p>

            <!-- Actions -->
            <div v-if="alert.action || alert.link" class="mt-3 flex gap-2">
              <UButton
                v-if="alert.action"
                @click="handleAction"
                :color="buttonColor"
                size="xs"
                variant="outline"
              >
                {{ alert.action }}
              </UButton>

              <UButton
                v-if="alert.link && !alert.action"
                @click="navigateTo(alert.link)"
                :color="buttonColor"
                size="xs"
                variant="solid"
              >
                Voir détails
              </UButton>
            </div>
          </div>

          <!-- Bouton fermer -->
          <UButton
            v-if="dismissible"
            @click="$emit('dismiss')"
            icon="i-heroicons-x-mark"
            size="xs"
            color="gray"
            variant="ghost"
            class="ml-2"
          />
        </div>
      </div>
    </div>

    <!-- Barre de progression (optionnelle) -->
    <div v-if="alert.progress !== undefined" class="mt-4">
      <div class="flex justify-between text-sm mb-1">
        <span class="text-gray-600">Progression</span>
        <span :class="titleClass">{{ Math.round(alert.progress) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          :class="progressBarClass"
          class="h-2 rounded-full transition-all duration-300"
          :style="{ width: `${alert.progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Métadonnées (optionnelles) -->
    <div v-if="alert.metadata" class="mt-3 pt-3 border-t border-gray-100">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div v-for="(value, key) in alert.metadata" :key="key">
          <span class="text-gray-500 capitalize">{{ key }}:</span>
          <span class="ml-1 font-medium">{{ value }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Alert {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  action?: string;
  link?: string;
  progress?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
}

interface Props {
  alert: Alert;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
});

const emit = defineEmits<{
  dismiss: [];
  action: [alert: Alert];
}>();

// Styles basés sur le type d'alerte
const alertStyles = computed(() => {
  const styles = {
    success: {
      cardBorder: "border-green-200",
      cardBg: "bg-green-50",
      iconWrapper: "bg-green-100",
      icon: "text-green-600",
      iconName: "i-heroicons-check-circle",
      title: "text-green-800",
      button: "green",
      progressBar: "bg-green-500",
    },
    warning: {
      cardBorder: "border-orange-200",
      cardBg: "bg-orange-50",
      iconWrapper: "bg-orange-100",
      icon: "text-orange-600",
      iconName: "i-heroicons-exclamation-triangle",
      title: "text-orange-800",
      button: "orange",
      progressBar: "bg-orange-500",
    },
    error: {
      cardBorder: "border-red-200",
      cardBg: "bg-red-50",
      iconWrapper: "bg-red-100",
      icon: "text-red-600",
      iconName: "i-heroicons-x-circle",
      title: "text-red-800",
      button: "red",
      progressBar: "bg-red-500",
    },
    info: {
      cardBorder: "border-blue-200",
      cardBg: "bg-blue-50",
      iconWrapper: "bg-blue-100",
      icon: "text-blue-600",
      iconName: "i-heroicons-information-circle",
      title: "text-blue-800",
      button: "blue",
      progressBar: "bg-blue-500",
    },
  };

  return styles[props.alert.type];
});

// Classes CSS calculées
const cardStyles = computed(() => ({
  base: `${alertStyles.value.cardBg} ${alertStyles.value.cardBorder} border`,
  body: { padding: "p-4" },
  header: { padding: "" },
}));

const iconWrapperClass = computed(
  () =>
    `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${alertStyles.value.iconWrapper}`
);

const iconClass = computed(() => `w-5 h-5 ${alertStyles.value.icon}`);

const iconName = computed(() => alertStyles.value.iconName);

const titleClass = computed(() => `font-semibold ${alertStyles.value.title}`);

const buttonColor = computed(() => alertStyles.value.button);

const progressBarClass = computed(() => alertStyles.value.progressBar);

// Actions
function handleAction() {
  emit("action", props.alert);

  if (props.alert.link) {
    navigateTo(props.alert.link);
  }
}

// Formatage des timestamps
const formattedTimestamp = computed(() => {
  if (!props.alert.timestamp) return null;

  const date = new Date(props.alert.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR");
});
</script>
