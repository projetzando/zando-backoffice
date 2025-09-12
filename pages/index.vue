<script setup lang="ts">
definePageMeta({
  name: "Connexion",
});

const user = ref<Auth>({
  name: "",
});

const showPassword = ref<boolean>(false);

const display_error = ref<string>("");

const display_errors = ref<string | string[]>("");

const tokenCookie = useCookie<string>("nkuna_token", {
  httpOnly: false,
  secure: true,
  sameSite: "strict",
});

const authStore = useAuthStore();

async function Login() {
  display_error.value = "";

  display_errors.value = "";

  const result = await authStore.login({
    email: user.value.email,
    password: user.value.password,
  });

  if (result.success) {
    // Connexion réussie
    navigateTo("/dashboard", {
      replace: true,
    });
  } else {
    // Gérer l'erreur
    display_error.value = result.error;
  }
}
</script>

<template>
  <FormAuth title="Connexion" :errors="display_errors" :error="display_error">
    <UForm
      :state="user"
      :schema="authSchema"
      class="space-y-4 mt-6"
      @submit="Login"
    >
      <UFormGroup label="Email" name="email">
        <UInput
          icon="i-heroicons-envelope"
          id="email"
          required
          v-model="user.email"
          placeholder="Votre adresse email"
          size="lg"
        />
      </UFormGroup>

      <UFormGroup class="relative" label="Mot de passe" name="password">
        <UInput
          icon="i-heroicons-lock-closed"
          id="password"
          required
          v-model="user.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Votre mot de passe"
          size="lg"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <Icon
              class="cursor-pointer"
              size="20"
              :name="`${
                showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'
              }`"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormGroup>

      <!-- <div class="text-right">
        <NuxtLink
          to="/"
          class="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700"
          >Mot de passe oublié?</NuxtLink
        >
      </div> -->

      <UButton
        type="submit"
        :loading="authStore.loading"
        label="Se connecter"
        class="w-full px-6 py-2 flex justify-center font-medium uppercase rounded-lg border-0"
      />
    </UForm>
  </FormAuth>
</template>
