export const useAppStore = defineStore("app", () => {
    const initData = ref<boolean>(false)

    const stats = ref<AllStat[]>([]);

    const last_payments = ref<Payment[]>([]);

    const config = ref<Data[]>([]);

    const loading = ref<boolean>(false);

    const { $api } = useNuxtApp();

    async function get() {
        loading.value = true;

        return $api<JsonResponseArray<AllStat[]>>('/dashboard', { method: 'GET' })
            .then((data) => {
                stats.value = data.data;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    async function lastPayments() {
        loading.value = true;

        return $api<JsonResponseArray<Payment[]>>('/last-paiements', { method: 'GET' })
            .then((data) => {
                last_payments.value = data.data;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    async function getConfig() {
        loading.value = true;

        return $api<JsonResponseArray<Data[]>>('/configurations/settings/enums', { method: 'GET' })
            .then((data) => {
                config.value = data.data;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    function $reset() {
        initData.value = false
        last_payments.value = []
        stats.value = []
        config.value = []
    }

    return {
        initData,
        loading,
        stats,
        get,
        lastPayments,
        getConfig,
        config,
        last_payments,
        $reset

    }
},
    {
        persist: {
            storage: piniaPluginPersistedstate.localStorage(),
        }
    }
)