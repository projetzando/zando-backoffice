export const useDatabase = () => {
  const supabase = useSupabaseClient();

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items").select("*");

    if (error) throw error;
    return data;
  };

  const addItem = async (item) => {
    const { data, error } = await supabase.from("items").insert(item).select();

    if (error) throw error;
    return data;
  };

  return {
    fetchItems,
    addItem,
  };
};
