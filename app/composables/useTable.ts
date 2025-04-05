export function useTable<T extends { [key: string]: any }>(data: Ref<T[]>) {
    const q = ref('');

    const page = ref(1);

    const pageCount = ref(5);

    const oneItem = ref<T>();

    const isOpen = ref(false);

    const filteredRows = computed(() => {
        return useUTableFilter<T>(q, data.value);
    });

    const rows = computed(() => {
        const start = (page.value - 1) * pageCount.value;

        const end = page.value * pageCount.value;

        return filteredRows.value.slice(start, end);
    });


    const totalFilteredRows = computed(() => filteredRows.value.length);

    const confirmDeleteItem = (item: T) => {
        oneItem.value = item;

        isOpen.value = true;
    };

    return {
        q,
        page,
        pageCount,
        oneItem,
        isOpen,
        filteredRows,
        rows,
        totalFilteredRows,
        confirmDeleteItem,
    };
}