export const useEnumStore = defineStore(
  "enum",
  () => {
    const enumTypes = ref<Record<string, string[]>>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchEnumTypes() {
      const supabase = useSupabaseClient();
      loading.value = true;

      try {
        const { data, error: supaError } = await supabase.rpc("get_enum_types");

        if (supaError) throw supaError;

        // Organiser les données par nom d'enum
        const grouped = data.reduce(
          (acc: Record<string, string[]>, curr: EnumType) => {
            if (!acc[curr.enum_name]) {
              acc[curr.enum_name] = [];
            }
            acc[curr.enum_name].push(curr.enum_value);
            return acc;
          },
          {}
        );

        enumTypes.value = grouped;
        return { success: true, data: grouped };
      } catch (err) {
        error.value = err.message;
        return { success: false, error: err.message };
      } finally {
        loading.value = false;
      }
    }

    function getEnumValues(enumName: string): string[] {
      return enumTypes.value[enumName] || [];
    }

    return {
      enumTypes,
      loading,
      error,
      fetchEnumTypes,
      getEnumValues,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  }
);
