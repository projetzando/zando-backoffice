export function useDelete<T>() {
    const loading = useState<boolean>('formLoading', () => false)

    const toast = useToast()

    const { handleSuccess } = useHandleErrors();

    async function deleteItem({ action, onSuccess }: {
        action: () => Promise<JsonResponseArray>,
        onSuccess: () => void
    }) {
        loading.value = true

        try {
            await action().then((data) => {
                onSuccess()

                handleSuccess(data.message)
            })
        } catch (error) {
            const err = error as JsonResponseError

            toast.add({
                title: err.data.message,
                description: err.data.error,
                color: 'orange',
                icon: 'i-heroicons-x-circle'
            })
        } finally {
            loading.value = false
        }
    }

    return { loading, deleteItem }
}