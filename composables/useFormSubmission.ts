export function useFormSubmission() {
    const error = useState<string>('formError', () => '')

    const errors = useState<string | string[]>('formErrors', () => (''))

    const loading = useState<boolean>('formLoading', () => false)

    const { handleSuccess } = useHandleErrors();

    async function submit<T>({ action, redirect, onSuccess }: {
        action: () => Promise<JsonResponseArray<T>>
        redirect?: () => void
        onSuccess?: () => void
    }) {
        error.value = ''

        errors.value = ''

        loading.value = true

        try {
            await action().then((data) => {
                if (onSuccess) onSuccess()

                handleSuccess(data.message)

                setTimeout(() => {
                    if (redirect) {
                        redirect()
                    }
                }, Timeout)
            })
        } catch (e) {
            const err = e as JsonResponseError

            if (err.data?.message) {
                errors.value = err.data.message
            } else {
                error.value = err.data?.message
            }
        } finally {
            loading.value = false
        }
    }

    return { error, errors, loading, submit }
}
