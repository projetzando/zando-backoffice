import type { z } from 'zod'

export function useValidateWithSchema<T extends object>(data: T, schema: z.ZodSchema<T>) {
  const validationErrors = ref<any[]>([])

  const validateData = (newValue: T) => {
    try {
      schema.parse(newValue)

      validationErrors.value = []
    }
    catch (error: any) {
      validationErrors.value = error.errors
    }
  }

  watch(data, validateData, { deep: true })

  return { validationErrors }
}

export function useSchemaValidator<T>(data: Ref<T>, schema: z.ZodSchema<T>) {
  const validationErrors = ref<z.ZodError | null>(null)

  watch(
    data,
    (newValue) => {
      try {
        schema.parse(newValue)

        validationErrors.value = null
      }
      catch (error: any) {
        validationErrors.value = error
      }
    },
    { deep: true },
  )

  return {
    validationErrors,
  }
}
