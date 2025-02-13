<script setup lang="ts">
definePageMeta({
    name: "Nouvelle marque",
    layout: 'dashboard'
})

const brandStore = useBrandStore()
const toast = useToast()

const { submit, error, errors, loading } = useFormSubmission()

function VIEW() {
    return navigateTo('/dashboard/configurations/brands')
}

const imagePreview = ref<string>('')

const brand = ref<Omit<Brand, 'id'>>({
    name: '',
    image: '',
    is_featured: false
})

async function handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Créer une prévisualisation
    imagePreview.value = URL.createObjectURL(file)

    // Upload de l'image
    const { success, data, error } = await brandStore.uploadImage(file)
    if (success && data) {
        brand.value.image = data
    } else {
        console.error(error)
    }
}

function handleSubmit() {
    if (!brand.value.image) {
        alert('Veuillez uploader une image')
        return
    }

    submit({
        action: () => brandStore.store(brand.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            brand.value = { name: '' }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper title="Nouvelle marque" :errors="errors" :error="error">
            <UForm :state="brand" :schema="brandSchema" class="my-3 space-y-4" @submit="handleSubmit">
                <div class="tablet:flex-col flex-col gap-2 flex">
                    <UFormGroup class="w-full" label="Nom" name="name">
                        <UInput required v-model="brand.name" placeholder="Nom de la marque" />
                    </UFormGroup>

                    <UFormGroup class="w-full" label="Image" name="image">
                        <ImageUploader v-model="brand.image" @change="handleImageChange" />
                    </UFormGroup>

                    <UFormGroup class="w-full" label="Is featured" name="is_featured">
                        <UCheckbox v-model="brand.is_featured" name="is_featured" label="Is featured" />
                    </UFormGroup>
                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="brandStore.loading" />

                    <UButton type="reset" color="red" label="Annuler" />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>