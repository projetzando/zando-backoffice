// stores/order-simple.ts - Version simple qui fonctionne immédiatement
export const useOrderStore = defineStore("order", () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Obtenir toutes les commandes
  async function getAll(filters?: {
    status?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      // 1. Récupérer les commandes de base sans relations complexes
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`id.ilike.%${filters.search}%`);
      }

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        orders.value = [];
        return { success: true, data: [] };
      }

      // 2. Enrichir chaque commande avec ses relations
      const enrichedOrders = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Récupérer le profil de l'acheteur
            let buyer = null;
            if (order.user_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", order.user_id)
                .single();
              buyer = profile;
            }

            // Récupérer les articles de la commande
            const { data: orderItems } = await supabase
              .from("order_items")
              .select(
                `
                                *,
                                product:products(*)
                            `
              )
              .eq("order_id", order.id);

            return {
              ...order,
              buyer,
              order_items: orderItems || [],
            };
          } catch (err) {
            console.warn(
              "Erreur lors de l'enrichissement de la commande:",
              order.id,
              err
            );
            return {
              ...order,
              buyer: null,
              order_items: [],
            };
          }
        })
      );

      orders.value = enrichedOrders;
      return { success: true, data: enrichedOrders };
    } catch (err: any) {
      error.value = err.message;
      console.error("Erreur lors de la récupération des commandes:", err);
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Obtenir une commande par ID
  async function getById(id: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      // 1. Récupérer la commande de base
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      // 2. Récupérer le profil de l'acheteur
      let buyer = null;
      if (orderData.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", orderData.user_id)
          .single();
        buyer = profile;
      }

      // 4. Récupérer les articles avec leurs produits
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(
          `
                    *,
                    product:products(
                        *,
                        category:categories(*)
                    ),
                    variation:product_variations(*)
                `
        )
        .eq("order_id", id);

      // 5. Récupérer les paiements
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", id);

      const enrichedOrder = {
        ...orderData,
        buyer,
        order_items: orderItems || [],
        payments: payments || [],
      };

      currentOrder.value = enrichedOrder;
      return { success: true, data: enrichedOrder };
    } catch (err: any) {
      error.value = err.message;
      console.error("Erreur lors de la récupération de la commande:", err);
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Créer une nouvelle commande
  async function create(
    orderData: Omit<Order, "id" | "created_at" | "updated_at">
  ) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (supaError) throw supaError;

      // Recharger la liste
      await getAll();

      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Mettre à jour une commande
  async function update(id: string, updates: Partial<Order>) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { data, error: supaError } = await supabase
        .from("orders")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (supaError) throw supaError;

      // Recharger la commande avec ses relations
      await getById(id);

      return { success: true, data };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Mettre à jour le statut d'une commande
  async function updateStatus(id: string, newStatus: string) {
    return await update(id, { status: newStatus });
  }

  // Supprimer une commande
  async function remove(id: string) {
    const supabase = useSupabaseClient();
    loading.value = true;
    error.value = null;

    try {
      const { error: supaError } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (supaError) throw supaError;

      orders.value = orders.value.filter((o) => o.id !== id);
      if (currentOrder.value?.id === id) {
        currentOrder.value = null;
      }

      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err };
    } finally {
      loading.value = false;
    }
  }

  // Reset du store
  function $reset() {
    orders.value = [];
    currentOrder.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    orders: readonly(orders),
    currentOrder: readonly(currentOrder),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    getAll,
    getById,
    create,
    update,
    updateStatus,
    remove,
    $reset,

    // Aliases pour la compatibilité
    get: getAll,
    show: getById,
  };
});
