<script setup lang="ts">
const user = defineModel<Auth>('user', { required: true, default: () => ({ name: '' }) });

const authStore = useAuthStore()

const { submit, error, errors, loading } = useFormSubmission()

function store() {
    submit({
        action: () => authStore.update(user.value),
    })
}
</script>


<template>
    <FormWrapper
        title="Mes infos"
        :errors="errors"
        :error="error"
    >
        <UForm
            :state="user"
            :schema="updateUserSchema"
            class="my-3 space-y-4"
            @submit="store"
        >
            <div class="tablet:flex-row flex-col gap-2 flex">
                <UFormGroup
                    class="w-full"
                    label="Nom"
                    name="name"
                >
                    <UInput
                        required
                        v-model="user.name"
                        placeholder="Nom de l'utilisateur"
                    />
                </UFormGroup>

                <UFormGroup
                    class="w-full"
                    label="Email"
                    name="email"
                >
                    <UInput
                        required
                        type="email"
                        disabled
                        v-model="user.email"
                        placeholder="Adresse email"
                    />
                </UFormGroup>
            </div>

            <div class="flex space-x-2">
                <ButtonSubmit v-model="authStore.loading" />

                <UButton
                    type="reset"
                    color="red"
                    label="Annuler"
                />
            </div>
        </UForm>
    </FormWrapper>
</template>