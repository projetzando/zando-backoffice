export function useFormSubmission() {
  const error = useState<string>('formError', () => '')
  const errors = useState<string | string[]>('formErrors', () => '')
  const loading = useState<boolean>('formLoading', () => false)
  const { handleSuccess, handleErrors } = useHandleErrors()

  async function submit<T>({
    action,
    redirect,
    onSuccess,
  }: {
    action: () => Promise<SupabaseResponse<T>>
    redirect?: () => void
    onSuccess?: () => void
  }) {
    error.value = ''
    errors.value = ''
    loading.value = true

    try {
      const response = await action()

      if (!response.success) {
        // Gestion des erreurs Supabase
        if (response.error) {
          if (response.error.message) {
            error.value = response.error.message
          }
          handleErrors({
            data: {
              error: response.error.message,
              message: response.error.details || response.error.message,
            },
          })
          return
        }
      }

      // Succès
      if (onSuccess) onSuccess()
      handleSuccess('Opération réussie')

      if (redirect) {
        setTimeout(() => redirect(), Timeout)
      }
    }
    catch (e) {
      const err = e as any
      error.value = err.message || 'Une erreur est survenue'
      handleErrors({
        data: {
          error: err.message,
          message: err.details || err.message,
        },
      })
    }
    finally {
      loading.value = false
    }
  }

  return { error, errors, loading, submit }
}
