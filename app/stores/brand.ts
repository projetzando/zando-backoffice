export const useBrandStore = defineStore('brand', () => {
    const brands = ref<Brand[]>([])
    const currentBrand = ref<Brand | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Obtenir toutes les marques
    async function get() {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .select('*')
                .order('name')

            if (supaError) throw supaError

            brands.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Obtenir une marque par ID
    async function show(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .select('*')
                .eq('id', id)
                .single()

            if (supaError) throw supaError

            currentBrand.value = data
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Upload d'image
    async function uploadImage(file: File) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            // Créer un nom de fichier unique
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `brands/${fileName}`

            // Upload du fichier
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Obtenir l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            return { success: true, data: publicUrl }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Créer une marque
    async function store(brand: Omit<Brand, 'id'>) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .insert([brand])
                .select()
                .single()

            if (supaError) throw supaError

            brands.value.push(data)
            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Mettre à jour une marque
    async function update(id: string, brand: Partial<Brand>) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { data, error: supaError } = await supabase
                .from('brands')
                .update(brand)
                .eq('id', id)
                .select()
                .single()

            if (supaError) throw supaError

            const index = brands.value.findIndex(b => b.id === id)
            if (index !== -1) {
                brands.value[index] = data
            }

            return { success: true, data }
        } catch (err) {
            error.value = err.message
            return { success: false, error: err }
        } finally {
            loading.value = false
        }
    }

    // Supprimer une marque
    async function destroy(id: string) {
        const supabase = useSupabaseClient()
        loading.value = true

        try {
            const { error: supaError } = await supabase
                .from('brands')
                .delete()
                .eq('id', id)

            if (supaError) throw supaError

            brands.value = brands.value.filter(b => b.id !== id)
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
        brands.value = []
        currentBrand.value = null
        loading.value = false
        error.value = null
    }

    return {
        brands,
        currentBrand,
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