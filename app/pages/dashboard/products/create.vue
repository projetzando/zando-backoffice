<script setup lang="ts">
definePageMeta({
    name: "Nouveau produit",
    layout: 'dashboard'
})

const productStore = useProductStore()

const { submit, error, errors, loading } = useFormSubmission()

function VIEW() {
    return navigateTo('/dashboard/products')
}

const imagePreview = ref<string>('')

const product = ref<Omit<Product, 'id'>>({})

async function handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    // Créer une prévisualisation
    imagePreview.value = URL.createObjectURL(file)

    // Upload de l'image
    const { success, data, error } = await productStore.uploadImage(file)
    if (success && data) {
        product.value.image = data
    } else {
        console.error(error)
    }
}

function handleSubmit() {
    if (!product.value.image) {
        alert('Veuillez uploader une image')
        return
    }

    submit({
        action: () => productStore.store(product.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            product.value = { }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper title="Nouveau produit" :errors="errors" :error="error">
            <UForm :state="product" :schema="productSchema" class="my-3 space-y-4" @submit="handleSubmit">
                <div class="md:flex-col flex-col gap-2 flex">
                    <UFormGroup class="w-full" label="Nom" name="name">
                        <UInput required v-model="product.name" placeholder="Nom du produit" />
                    </UFormGroup>

                    <UFormGroup class="w-full" label="Image" name="image">
                        <ImageUploader v-model="product.image" @change="handleImageChange" />
                    </UFormGroup>

                    <UFormGroup class="w-full" label="Is featured" name="is_featured">
                        <UCheckbox v-model="product.is_featured" name="is_featured" label="Is featured" />
                    </UFormGroup>
                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="productStore.loading" />

                    <UButton type="reset" color="red" label="Annuler" />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>