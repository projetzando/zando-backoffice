<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  name: "Créer un produit",
});

const productStore = useProductStore();
const router = useRouter();

// Form data
const form = ref({
  title: "",
  description: "",
  price: null,
  sale_price: null,
  stock: 0,
  category_id: "",
  seller_id: "",
  product_type: "simple",
  is_active: true,
  is_featured: false,
  cover_image: "",
  images: [],
  variations: [],
});

// Form validation
const errors = ref({
  title: "",
  description: "",
  price: "",
  sale_price: "",
  stock: "",
  category_id: "",
  seller_id: "",
  cover_image: "",
  images: "",
  submit: "",
});
const isSubmitting = ref(false);

// Categories and sellers
const { data: categories } = await useLazyAsyncData("categories", async () => {
  const supabase = useSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true);
  return data || [];
});

const { data: sellers } = await useLazyAsyncData("sellers", async () => {
  const supabase = useSupabaseClient();
  const { data } = await supabase.from("sellers").select("id, company_name");
  // .eq("is_approved", true);
  return data || [];
});

// Product type options
const productTypeOptions = [
  { label: "Simple", value: "simple" },
  { label: "Variable", value: "variable" },
];

// Category options
const categoryOptions = computed(
  () =>
    categories.value?.map((cat) => ({ label: cat.name, value: cat.id })) || []
);

// Seller options
const sellerOptions = computed(
  () =>
    sellers.value?.map((seller) => ({
      label: seller.company_name,
      value: seller.id,
    })) || []
);

// Image upload
const imageFiles = ref([]);
const coverImageFile = ref(null);
const coverImagePreview = ref(null);
const imagesPreviews = ref([]);

// Fonction pour gérer l'upload de l'image de couverture
function handleCoverImageUpload(file) {
  if (!file) return;

  // Validation du fichier
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    errors.value.cover_image =
      "Format d'image non supporté. Utilisez JPG, PNG ou WebP.";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5MB max
    errors.value.cover_image = "L'image est trop volumineuse (max 5MB).";
    return;
  }

  coverImageFile.value = file;
  errors.value.cover_image = "";

  // Créer un aperçu
  const reader = new FileReader();
  reader.onload = (e) => {
    coverImagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Fonction pour gérer l'upload des images de galerie
function handleImageUpload(files) {
  const validFiles = [];
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      errors.value.images =
        "Certaines images ont un format non supporté. Utilisez JPG, PNG ou WebP.";
      continue;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      errors.value.images =
        "Certaines images sont trop volumineuses (max 5MB par image).";
      continue;
    }

    validFiles.push(file);
  }

  imageFiles.value = [...imageFiles.value, ...validFiles];
  if (validFiles.length > 0) {
    errors.value.images = "";
  }

  // Créer des aperçus
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagesPreviews.value.push({
        file,
        preview: e.target.result,
        id: Date.now() + Math.random(),
      });
    };
    reader.readAsDataURL(file);
  });
}

// Fonction pour supprimer une image de la galerie
function removeImage(index) {
  imageFiles.value.splice(index, 1);
  imagesPreviews.value.splice(index, 1);
}

// Fonction pour supprimer l'image de couverture
function removeCoverImage() {
  coverImageFile.value = null;
  coverImagePreview.value = null;
}

// Fonction pour uploader un fichier vers Supabase Storage
async function uploadImageToStorage(file, folder = "products") {
  try {
    const supabase = useSupabaseClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
}

// Variations management
const showVariations = computed(() => form.value.product_type === "variable");

function addVariation() {
  form.value.variations.push({
    name: "",
    price: null,
    stock_quantity: 0,
    is_default: form.value.variations.length === 0,
  });
}

function removeVariation(index) {
  form.value.variations.splice(index, 1);
  // Si on supprime la variation par défaut, faire la première comme défaut
  if (
    form.value.variations.length > 0 &&
    !form.value.variations.some((v) => v.is_default)
  ) {
    form.value.variations[0].is_default = true;
  }
}

function setDefaultVariation(index) {
  form.value.variations.forEach((variation, i) => {
    variation.is_default = i === index;
  });
}

// Form validation
function validateForm() {
  errors.value = {};

  if (!form.value.title.trim()) {
    errors.value.title = "Le titre est requis";
  }

  if (!form.value.description.trim()) {
    errors.value.description = "La description est requise";
  }

  if (!form.value.category_id) {
    errors.value.category_id = "La catégorie est requise";
  }

  if (!form.value.seller_id) {
    errors.value.seller_id = "Le vendeur est requis";
  }

  if (form.value.product_type === "simple") {
    if (!form.value.price || form.value.price <= 0) {
      errors.value.price = "Le prix doit être supérieur à 0";
    }
    if (form.value.stock < 0) {
      errors.value.stock = "Le stock ne peut pas être négatif";
    }
  }

  if (form.value.product_type === "variable") {
    if (form.value.variations.length === 0) {
      errors.value.variations =
        "Au moins une variation est requise pour un produit variable";
    } else {
      form.value.variations.forEach((variation, index) => {
        if (!variation.name.trim()) {
          errors.value[`variation_${index}_name`] =
            "Le nom de la variation est requis";
        }
        if (!variation.price || variation.price <= 0) {
          errors.value[`variation_${index}_price`] =
            "Le prix doit être supérieur à 0";
        }
        if (variation.stock_quantity < 0) {
          errors.value[`variation_${index}_stock`] =
            "Le stock ne peut pas être négatif";
        }
      });
    }
  }

  if (
    form.value.sale_price &&
    form.value.price &&
    form.value.sale_price >= form.value.price
  ) {
    errors.value.sale_price =
      "Le prix de vente doit être inférieur au prix normal";
  }

  return Object.keys(errors.value).length === 0;
}

// Submit form
async function submitForm() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Préparer les données du produit
    const productData = {
      title: form.value.title,
      description: form.value.description,
      category_id: form.value.category_id,
      seller_id: form.value.seller_id,
      product_type: form.value.product_type,
      is_active: form.value.is_active,
      is_featured: form.value.is_featured,
    };

    // Pour les produits simples
    if (form.value.product_type === "simple") {
      productData.price = parseFloat(form.value.price);
      productData.sale_price = form.value.sale_price
        ? parseFloat(form.value.sale_price)
        : null;
      productData.stock = parseInt(form.value.stock);
    }

    // Upload des images
    if (coverImageFile.value) {
      try {
        const coverImageUrl = await uploadImageToStorage(
          coverImageFile.value,
          "products/covers"
        );
        productData.cover_image = coverImageUrl;
      } catch (error) {
        throw new Error(
          "Erreur lors de l'upload de l'image de couverture: " + error.message
        );
      }
    }

    if (imageFiles.value.length > 0) {
      try {
        const imageUrls = [];
        for (const imageFile of imageFiles.value) {
          const imageUrl = await uploadImageToStorage(
            imageFile,
            "products/gallery"
          );
          imageUrls.push(imageUrl);
        }
        productData.images = imageUrls;
      } catch (error) {
        throw new Error("Erreur lors de l'upload des images: " + error.message);
      }
    }

    // Créer le produit
    const result = await productStore.create(productData);

    if (result.success) {
      // TODO: Créer les variations si produit variable
      if (
        form.value.product_type === "variable" &&
        form.value.variations.length > 0
      ) {
        // Créer les variations
      }

      // Redirection vers la liste des produits
      await router.push("/dashboard/products");

      // Notification de succès
      console.log("Produit créé avec succès");
    } else {
      throw new Error(
        result.error?.message || "Erreur lors de la création du produit"
      );
    }
  } catch (error) {
    console.error("Erreur:", error);
    errors.value.submit = error.message;
  } finally {
    isSubmitting.value = false;
  }
}

function goBack() {
  router.push("/dashboard/products");
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <UButton
              @click="goBack"
              icon="i-heroicons-arrow-left"
              variant="ghost"
              size="sm"
            >
              Retour
            </UButton>
            <div class="h-6 border-l border-gray-300"></div>
            <h1 class="text-xl font-semibold text-gray-900">
              Créer un nouveau produit
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="submitForm" class="space-y-8">
        <!-- Informations de base -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            Informations de base
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Titre -->
            <div class="lg:col-span-2">
              <UFormGroup label="Titre du produit *" :error="errors.title">
                <UInput
                  v-model="form.title"
                  placeholder="Nom du produit..."
                  size="lg"
                  :color="errors.title ? 'red' : 'primary'"
                />
              </UFormGroup>
            </div>

            <!-- Description -->
            <div class="lg:col-span-2">
              <UFormGroup label="Description *" :error="errors.description">
                <UTextarea
                  v-model="form.description"
                  placeholder="Description détaillée du produit..."
                  :rows="4"
                  resize
                  :color="errors.description ? 'red' : 'primary'"
                />
              </UFormGroup>
            </div>

            <!-- Catégorie -->
            <div>
              <UFormGroup label="Catégorie *" :error="errors.category_id">
                <USelect
                  v-model="form.category_id"
                  :options="categoryOptions"
                  placeholder="Sélectionner une catégorie"
                  size="lg"
                />
              </UFormGroup>
            </div>

            <!-- Vendeur -->
            <div>
              <UFormGroup label="Vendeur *" :error="errors.seller_id">
                <USelect
                  v-model="form.seller_id"
                  :options="sellerOptions"
                  placeholder="Sélectionner un vendeur"
                  size="lg"
                />
              </UFormGroup>
            </div>

            <!-- Type de produit -->
            <div>
              <UFormGroup label="Type de produit">
                <USelect
                  v-model="form.product_type"
                  :options="productTypeOptions"
                  size="lg"
                />
              </UFormGroup>
            </div>

            <!-- Statuts -->
            <div class="space-y-4">
              <UFormGroup label="Options">
                <div class="space-y-3">
                  <UCheckbox
                    v-model="form.is_active"
                    label="Produit actif"
                    help="Le produit sera visible sur le site"
                  />
                  <UCheckbox
                    v-model="form.is_featured"
                    label="Produit en vedette"
                    help="Le produit apparaîtra dans les produits mis en avant"
                  />
                </div>
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- Prix et stock (produit simple) -->
        <div
          v-if="form.product_type === 'simple'"
          class="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            Prix et stock
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Prix -->
            <div>
              <UFormGroup label="Prix *" :error="errors.price">
                <UInput
                  v-model="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  size="lg"
                  :color="errors.price ? 'red' : 'primary'"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-xs"
                      >XAF</span
                    >
                  </template>
                </UInput>
              </UFormGroup>
            </div>

            <!-- Prix de vente -->
            <div>
              <UFormGroup
                label="Prix de vente"
                :error="errors.sale_price"
                help="Prix promotionnel (optionnel)"
              >
                <UInput
                  v-model="form.sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  size="lg"
                  :color="errors.sale_price ? 'red' : 'primary'"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-xs"
                      >XAF</span
                    >
                  </template>
                </UInput>
              </UFormGroup>
            </div>

            <!-- Stock -->
            <div>
              <UFormGroup label="Stock" :error="errors.stock">
                <UInput
                  v-model="form.stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  size="lg"
                  :color="errors.stock ? 'red' : 'primary'"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-xs"
                      >unités</span
                    >
                  </template>
                </UInput>
              </UFormGroup>
            </div>
          </div>

          <!-- Aperçu des prix -->
          <div v-if="form.price" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              Aperçu des prix
            </h4>
            <div class="flex items-center space-x-4">
              <div>
                <span class="text-sm text-gray-500">Prix normal:</span>
                <span class="text-lg font-semibold text-gray-900 ml-2">{{
                  formatPrice(form.price)
                }}</span>
              </div>
              <div v-if="form.sale_price">
                <span class="text-sm text-gray-500">Prix de vente:</span>
                <span class="text-lg font-semibold text-green-600 ml-2">{{
                  formatPrice(form.sale_price)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Variations (produit variable) -->
        <div v-if="showVariations" class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Variations du produit
            </h2>
            <UButton @click="addVariation" icon="i-heroicons-plus" size="sm">
              Ajouter une variation
            </UButton>
          </div>

          <div v-if="errors.variations" class="mb-4">
            <div class="text-sm text-red-600">{{ errors.variations }}</div>
          </div>

          <div v-if="form.variations.length === 0" class="text-center py-8">
            <UIcon
              name="i-heroicons-squares-plus"
              class="w-12 h-12 text-gray-400 mx-auto mb-3"
            />
            <p class="text-gray-500">Aucune variation créée</p>
            <p class="text-sm text-gray-400">
              Cliquez sur "Ajouter une variation" pour commencer
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(variation, index) in form.variations"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-start justify-between mb-4">
                <h4 class="font-medium text-gray-900">
                  Variation {{ index + 1 }}
                </h4>
                <div class="flex items-center space-x-2">
                  <UButton
                    v-if="!variation.is_default"
                    @click="setDefaultVariation(index)"
                    variant="outline"
                    size="xs"
                  >
                    Définir par défaut
                  </UButton>
                  <UBadge v-else color="primary" variant="subtle" size="sm">
                    Par défaut
                  </UBadge>
                  <UButton
                    @click="removeVariation(index)"
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="xs"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Nom de la variation -->
                <div>
                  <UFormGroup
                    label="Nom de la variation *"
                    :error="errors[`variation_${index}_name`]"
                  >
                    <UInput
                      v-model="variation.name"
                      placeholder="Ex: Rouge, Taille M..."
                      size="lg"
                    />
                  </UFormGroup>
                </div>

                <!-- Prix -->
                <div>
                  <UFormGroup
                    label="Prix *"
                    :error="errors[`variation_${index}_price`]"
                  >
                    <UInput
                      v-model="variation.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      size="lg"
                    >
                      <template #trailing>
                        <span class="text-gray-500 text-xs">€</span>
                      </template>
                    </UInput>
                  </UFormGroup>
                </div>

                <!-- Stock -->
                <div>
                  <UFormGroup
                    label="Stock"
                    :error="errors[`variation_${index}_stock`]"
                  >
                    <UInput
                      v-model="variation.stock_quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      size="lg"
                    >
                      <template #trailing>
                        <span class="text-gray-500 text-xs">unités</span>
                      </template>
                    </UInput>
                  </UFormGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">
            Images du produit
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Image de couverture -->
            <div>
              <UFormGroup
                label="Image de couverture"
                :error="errors.cover_image"
              >
                <div
                  v-if="!coverImagePreview"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="w-12 h-12 text-gray-400 mx-auto mb-3"
                  />
                  <p class="text-sm text-gray-600 mb-3">
                    Glissez-déposez votre image de couverture ici
                  </p>
                  <input
                    ref="coverImageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="
                      (e) =>
                        e.target.files[0] &&
                        handleCoverImageUpload(e.target.files[0])
                    "
                  />
                  <UButton
                    variant="outline"
                    size="sm"
                    @click="$refs.coverImageInput.click()"
                  >
                    Choisir un fichier
                  </UButton>
                </div>

                <!-- Aperçu de l'image de couverture -->
                <div v-else class="relative">
                  <img
                    :src="coverImagePreview"
                    alt="Aperçu image de couverture"
                    class="w-full h-48 object-cover rounded-lg"
                  />
                  <UButton
                    @click="removeCoverImage"
                    icon="i-heroicons-x-mark"
                    color="red"
                    variant="solid"
                    size="sm"
                    class="absolute top-2 right-2"
                  />
                </div>
              </UFormGroup>
            </div>

            <!-- Galerie d'images -->
            <div>
              <UFormGroup
                label="Galerie d'images"
                help="Vous pouvez ajouter plusieurs images"
                :error="errors.images"
              >
                <div
                  v-if="imagesPreviews.length === 0"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="w-12 h-12 text-gray-400 mx-auto mb-3"
                  />
                  <p class="text-sm text-gray-600 mb-3">
                    Glissez-déposez vos images ici
                  </p>
                  <input
                    ref="imagesInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="
                      (e) =>
                        e.target.files.length > 0 &&
                        handleImageUpload(Array.from(e.target.files))
                    "
                  />
                  <UButton
                    variant="outline"
                    size="sm"
                    @click="$refs.imagesInput.click()"
                  >
                    Choisir des fichiers
                  </UButton>
                </div>

                <!-- Aperçus des images -->
                <div v-else>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div
                      v-for="(preview, index) in imagesPreviews"
                      :key="preview.id"
                      class="relative group"
                    >
                      <img
                        :src="preview.preview"
                        alt="`Image ${index + 1}`"
                        class="w-full h-24 object-cover rounded-lg"
                      />
                      <UButton
                        @click="removeImage(index)"
                        icon="i-heroicons-x-mark"
                        color="red"
                        variant="solid"
                        size="sm"
                        class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>

                  <!-- Bouton pour ajouter plus d'images -->
                  <UButton
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-plus"
                    @click="$refs.imagesInput.click()"
                    class="w-full"
                  >
                    Ajouter plus d'images
                  </UButton>
                  <input
                    ref="imagesInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="
                      (e) =>
                        e.target.files.length > 0 &&
                        handleImageUpload(Array.from(e.target.files))
                    "
                  />
                </div>
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- Erreur de soumission -->
        <div
          v-if="errors.submit"
          class="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div class="flex">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-5 h-5 text-red-400"
            />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur lors de la création du produit
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ errors.submit }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-6">
          <UButton @click="goBack" variant="ghost" size="lg"> Annuler </UButton>

          <div class="flex items-center space-x-3">
            <UButton
              type="submit"
              size="lg"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Création en cours..." : "Créer le produit" }}
            </UButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
