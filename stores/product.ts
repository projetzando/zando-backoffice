export const useProductStore = defineStore('product', () => {
    const products = ref<Product[]>([])
    const currentProduct = ref<Product | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Obtenir tous les produits
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('products')
                .select('*, sellers(*), categories(*),  brands(*)')
                .order('title')

            if (supaError) throw supaError

            products.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Obtenir un produit par ID
    async function show(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('products')
                .select('*, product_images(*), product_variants(*), product_views(*), sellers(*), categories(*),  brands(*)')
                .eq('id', id)
                .single()

            if (supaError) throw supaError

            if (data.sellers && Array.isArray(data.sellers)) {
                data.seller = data.sellers[0]  // Assigner le premier élément si un seul vendeur est attendu
                delete data.sellers
            }

            currentProduct.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Upload d'image pour un produit
    async function uploadImage(file: File, productId: string) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `products/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            await supabase
                .from('product_images')
                .insert({ product_id: productId, url: publicUrl })

            return { success: true, data: publicUrl }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Créer un produit
    async function store(product: Omit<Product, 'id'>) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single()

            if (supaError) throw supaError

            products.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Mettre à jour un produit
    async function update(id: string, product: Partial<Product>) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('products')
                .update(product)
                .eq('id', id)
                .select()
                .single()

            if (supaError) throw supaError

            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = data
            }

            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Supprimer un produit
    async function destroy(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { error: supaError } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (supaError) throw supaError

            products.value = products.value.filter(p => p.id !== id)
            return { success: true }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Reset du store
    function $reset() {
        products.value = []
        currentProduct.value = null
        loading.value = false
        error.value = null
    }

    return {
        products,
        currentProduct,
        loading,
        error,
        get,
        show,
        uploadImage,
        store,
        update,
        destroy,
        $reset
    }
})
