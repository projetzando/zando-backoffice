<script setup lang="ts">
const authStore = useAuthStore()

const { submit, error, errors, loading } = useFormSubmission()

const password = ref<NewPassword>({
    old_password: "",
})

const show = ref<boolean>(true)

const show_old = ref<boolean>(true)

const show_confirmation = ref<boolean>(true)

function changePassword() {
    submit({
        action: () => authStore.changePassword({
            old_password: password.value.old_password,
            password: password.value.password,
            password_confirmation: password.value.password_confirmation,
        }),
        onSuccess: () => {
            password.value = { old_password: '' }
        }
    })
}
</script>

<template>
    <FormWrapper
        title="Réinitialisation du mot de passe"
        :errors="errors"
        :error="error"
    >
        <UForm
            :state="password"
            :schema="changePasswordSchema"
            class="my-3 space-y-4"
            @submit="changePassword"
        >
            <div class="tablet:flex-row flex-col gap-2 flex">
                <UFormGroup
                    class="w-full"
                    label="Ancient mot de passe"
                    name="old_password"
                >
                    <UInput
                        :type="show_old ? 'password' : 'text'"
                        required
                        v-model="password.old_password"
                        placeholder="Mot de passe"
                    >
                        <template #trailing>
                            <UButton
                                :icon="show_old ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                                color="gray"
                                variant="ghost"
                                square
                                @click="show_old = !show_old"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UFormGroup
                    class="w-full"
                    label="Nouveau mot de passe"
                    name="password"
                >
                    <UInput
                        :type="show ? 'password' : 'text'"
                        required
                        v-model="password.password"
                        placeholder="Mot de passe"
                    >
                        <template #trailing>
                            <UButton
                                :icon="show ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                                color="gray"
                                variant="ghost"
                                square
                                @click="show = !show"
                            />
                        </template>
                    </UInput>
                </UFormGroup>

                <UFormGroup
                    class="w-full"
                    label="Répéter le mot de passe"
                    name="password_confirmation"
                >
                    <UInput
                        :type="show_confirmation ? 'password' : 'text'"
                        required
                        v-model="password.password_confirmation"
                        placeholder="Confirmer le mot de passe"
                    >
                        <template #trailing>
                            <UButton
                                :icon="show_confirmation ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                                color="gray"
                                variant="ghost"
                                square
                                @click="show_confirmation = !show_confirmation"
                            />
                        </template>
                    </UInput>
                </UFormGroup>
            </div>

            <div class="flex space-x-2">
                <UButton
                    type="submit"
                    color="primary"
                    label="Modifier"
                    :loading="authStore.loading"
                />

                <UButton
                    type="reset"
                    color="red"
                    label="Annuler"
                />
            </div>
        </UForm>
    </FormWrapper>
</template>