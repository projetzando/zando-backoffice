// stores/product.ts
export const useProductStore = defineStore("product", () => {
  const products = ref<ProductWithPrice[]>([]);
  const currentProduct = ref<ProductWithPrice | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtenir tous les produits avec relations (utilise la vue products_with_price par défaut)
  async function getAll(filters?: {
    seller_id?: string;
    category_id?: string;
    is_active?: boolean;
    search?: string;
  }) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from("products_with_price")
        .select("*")
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters?.seller_id) {
        query = query.eq("seller_id", filters.seller_id);
      }
      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
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

  // Obtenir un produit par ID avec toutes ses relations (utilise la vue pour les calculs)
  async function getById(id: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("products_with_price")
        .select("*")
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
                    category:categories(*),
                    product_variations(*)
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

  // Upload d'images pour un produit (version simplifiée)
  async function uploadImages(files: File[], productId: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${productId}/${Date.now()}_${index}.${fileExt}`;
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

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      return { success: true, data: imageUrls };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Gérer les variations d'un produit
  async function manageVariations(productId: string, variations: Partial<ProductVariation>[]) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      // Supprimer les anciennes variations
      await supabase.from('product_variations').delete().eq('product_id', productId);
      
      // Ajouter les nouvelles variations
      if (variations.length > 0) {
        const { data, error: supaError } = await supabase
          .from('product_variations')
          .insert(variations.map(v => ({ ...v, product_id: productId })))
          .select();
          
        if (supaError) throw supaError;
        return { success: true, data };
      }
      
      return { success: true, data: [] };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Obtenir les produits depuis la table brute (pour l'édition)
  async function getProductsRaw(filters?: {
    seller_id?: string;
    category_id?: string;
    is_active?: boolean;
    search?: string;
  }) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:sellers(*),
          category:categories(*),
          product_variations(*),
          product_attributes(*)
        `)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters?.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error: supaError } = await query;

      if (supaError) throw supaError;

      return { success: true, data: data || [] };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
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
    uploadImages,
    manageVariations,
    getProductsRaw,
    $reset,
  };
});
