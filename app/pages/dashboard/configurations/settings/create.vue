<script setup lang="ts">
definePageMeta({
    name: "Nouveau paramètre",
    layout: 'dashboard'
})

const settingStore = useSettingStore()

const { submit, error, errors, loading } = useFormSubmission()

const setting = ref<Setting>({
    key: '',
    value: '',
})

function VIEW() {
    return navigateTo('/dashboard/configurations/settings')
}

function store() {
    submit({
        action: () => settingStore.store(setting.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            setting.value = { key: '', value: '' }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Nouveau paramètre"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="setting"
                class="my-3 space-y-4"
                @submit="store"
            >
                <div class="tablet:flex-row flex-col gap-2 flex">
                    <UFormGroup
                        class="w-full"
                        label="Clé"
                        name="key"
                    >
                        <UInput
                            required
                            v-model="setting.key"
                            placeholder="Clé du paramètre"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Valeur"
                        name="value"
                    >
                        <UInput
                            required
                            v-model="setting.value"
                            placeholder="Valeur du paramètre"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Description"
                        name="description"
                    >
                        <UInput
                            required
                            v-model="setting.description"
                            placeholder="Description du paramètre"
                        />
                    </UFormGroup>

                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="settingStore.loading" />

                    <UButton
                        type="reset"
                        color="error"
                        label="Annuler"
                    />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>