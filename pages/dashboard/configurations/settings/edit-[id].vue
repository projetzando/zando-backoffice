<script setup lang="ts">
definePageMeta({
    name: "Modification d'un paramètre",
    // roles: ['admin', 'superadmin'],
    layout: 'dashboard'
})

const settingStore = useSettingStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const setting = ref<Setting>({
    key: '',
    value: '',
})

await settingStore.show(route.params.id).then((data) => {
    setting.value = data.data
})

function VIEW() {
    return navigateTo('/dashboard/configurations/settings')
}

function edit() {
    submit({
        action: () => settingStore.update(setting.value.id, setting.value),
        redirect: () => VIEW(),
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Modification paramètre"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="setting"
                class="my-3 space-y-4"
                @submit="edit"
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
                        color="red"
                        label="Annuler"
                    />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>