<script setup lang="ts">
const file = defineModel()

const acceptFormats = ['image/jpeg', 'image/jpg', 'image/png'];

const fileInputRef = ref<HTMLInputElement | null>(null);

const previewUrl = ref<string | null>(null);

const errorMessage = ref<string>('');

function handleFileSelection(event: Event) {
    const target = event.target as HTMLInputElement;

    const selectedFile = target.files?.[0] || null;

    errorMessage.value = '';

    if (selectedFile) {
        if (!acceptFormats.includes(selectedFile.type)) {
            errorMessage.value = 'Le format du fichier n\'est pas pris en charge. Veuillez sélectionner un fichier JPEG ou PNG.';

            target.value = '';
        } else if (selectedFile.size > 500 * 1024) {
            errorMessage.value = 'La taille du fichier ne doit pas dépasser 500 Ko.';

            target.value = '';
        } else {
            previewUrl.value = URL.createObjectURL(selectedFile);

            file.value = selectedFile;
        }
    }
}

function removeImage() {
    previewUrl.value = null;

    file.value = null;

    errorMessage.value = '';

    if (fileInputRef.value) {
        fileInputRef.value.value = '';
    }
}

watch(file, (newValue) => {
    if (newValue === undefined) {
        previewUrl.value = null
    }
})
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <label
            v-if="!previewUrl && !file"
            for="img"
            class="flex flex-col items-center px-4 py-4 border rounded-full cursor-pointer"
        >
            <UIcon
                class="w-8 h-8"
                name="heroicons:photo"
            />
        </label>

        <img
            v-else-if="previewUrl"
            class="w-40 h-40 rounded-full"
            :src="previewUrl"
            alt="Image Preview"
        />

        <img
            v-else-if="file"
            class="w-40 h-40 rounded-full"
            :src="file"
            alt="Image Preview"
        />

        <input
            id="img"
            type="file"
            accept="image/png, image/jpeg"
            class="hidden"
            ref="fileInputRef"
            @change="handleFileSelection"
        />

        <span
            v-if="errorMessage"
            class="text-red-500 text-[13px] mt-2"
        >{{ errorMessage }}</span>

        <UButton
            v-if="previewUrl || file"
            @click="removeImage"
            label="Retirer"
            color="red"
            class="my-2"
        />
    </div>
</template>