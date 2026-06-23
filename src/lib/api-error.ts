// Normaliza o campo `error` de uma resposta da API para uma string exibível.
// As API Routes retornam `error` como string (AppError) OU como objeto do
// `ZodError.flatten()` ({ formErrors, fieldErrors }) nos 400 de validação.
// Renderizar o objeto direto quebra o React; este helper extrai uma mensagem.

type FlattenedZodError = {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

function isFlattenedZodError(value: unknown): value is FlattenedZodError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'formErrors' in value &&
    'fieldErrors' in value
  )
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error

  if (isFlattenedZodError(error)) {
    const formError = error.formErrors[0]
    if (formError) return formError

    const firstFieldErrors = Object.values(error.fieldErrors)[0]
    if (firstFieldErrors?.[0]) return firstFieldErrors[0]
  }

  return fallback
}
