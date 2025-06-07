// stores/product.ts
export const useProductStore = defineStore("product", () => {
  const products = ref<Product[]>([]);
  const currentProduct = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtenir tous les produits avec relations
  async function getAll(filters?: {
    seller_id?: string;
    category_id?: string;
    status?: string;
    search?: string;
  }) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from("products")
        .select(
          `
                    *,
                    seller:sellers(*),
                    category:categories(*),
                    product_images(*),
                    product_variants(*)
                `
        )
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters?.seller_id) {
        query = query.eq("seller_id", filters.seller_id);
      }
      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      const { data, error: supaError } = await query;

      if (supaError) throw supaError;

      products.value = data || [];
      return { success: true, data: data || [] };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Obtenir un produit par ID avec toutes ses relations
  async function getById(id: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("products")
        .select(
          `
                    *,
                    seller:sellers(*),
                    category:categories(*),
                    product_images(*),
                    product_variants(*),
                    product_views(*)
                `
        )
        .eq("id", id)
        .single();

      if (supaError) throw supaError;

      currentProduct.value = data;
      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Créer un nouveau produit
  async function create(
    productData: Omit<Product, "id" | "created_at" | "updated_at">
  ) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("products")
        .insert([productData])
        .select(
          `
                    *,
                    seller:sellers(*),
                    category:categories(*)
                `
        )
        .single();

      if (supaError) throw supaError;

      products.value.unshift(data);
      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Mettre à jour un produit
  async function update(id: string, updates: Partial<Product>) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select(
          `
                    *,
                    seller:sellers(*),
                    category:categories(*)
                `
        )
        .single();

      if (supaError) throw supaError;

      // Mettre à jour dans la liste
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = data;
      }

      // Mettre à jour le produit courant si c'est lui
      if (currentProduct.value?.id === id) {
        currentProduct.value = data;
      }

      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Supprimer un produit
  async function remove(id: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { error: supaError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (supaError) throw supaError;

      products.value = products.value.filter((p) => p.id !== id);
      if (currentProduct.value?.id === id) {
        currentProduct.value = null;
      }

      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Upload d'images pour un produit
  async function uploadImage(
    file: File,
    productId: string,
    position: number = 0,
    isMain: boolean = false
  ) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload du fichier
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      // Enregistrer en base
      const { data, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          url: publicUrl,
          position,
          is_main: isMain,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Supprimer une image
  async function removeImage(imageId: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { error: supaError } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (supaError) throw supaError;

      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Enregistrer une vue de produit
  async function recordView(
    productId: string,
    userId?: string,
    ipAddress?: string,
    deviceInfo?: object
  ) {
    const supabase = useSupabaseClient();

    try {
      await supabase.from("product_views").insert({
        product_id: productId,
        user_id: userId,
        ip_address: ipAddress,
        device_info: deviceInfo,
      });
    } catch (err) {
      // Ne pas faire échouer si l'enregistrement de la vue échoue
      console.warn("Erreur lors de l'enregistrement de la vue:", err);
    }
  }

  // Reset du store
  function $reset() {
    products.value = [];
    currentProduct.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    getAll,
    getById,
    create,
    update,
    remove,
    uploadImage,
    removeImage,
    recordView,
    $reset,
  };
});
