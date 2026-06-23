# Fix — Erro de validação renderizado como objeto React

**Branch:** `fix/form-error-rendering` (PR #36, base `main`)
**Data:** 2026-06-23
**Sprint:** 2 (bugfix de runtime, sem issue formal)

---

## Contexto

Durante o uso em desenvolvimento, submeter um formulário com dados que falhavam na validação
do servidor quebrava a aplicação com:

```
Error: Objects are not valid as a React child (found: object with keys {formErrors, fieldErrors})
```

---

## Causa

As API Routes retornam o campo `error` de **duas formas diferentes**:

- **string** para erros de domínio (`AppError.message`, ex.: "Não autorizado"); e
- **objeto** do `ZodError.flatten()` — `{ formErrors, fieldErrors }` — nos `400` de validação
  (padrão da CLAUDE.md §8).

Todos os formulários faziam `setError(data.error ?? '...')` e depois renderizavam `{error}`.
Quando `data.error` era o objeto flatten, o React recebia um objeto como filho e quebrava.

Caminho mais provável de disparo: **login** — é o único formulário **sem validação Zod no
cliente**, então um `400` do servidor sempre chega ao `setError` como objeto.

---

## Decisões tomadas

### Helper puro `getApiErrorMessage` em `src/lib/api-error.ts`

```ts
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
```

Normaliza qualquer forma para uma **string** legível: string → ela mesma; objeto Zod flatten
→ primeiro `formErrors`, senão a primeira mensagem de `fieldErrors`; caso contrário, `fallback`.

**Por quê:** centraliza a normalização num único ponto puro e testável (CLAUDE.md §12, §18),
em vez de repetir lógica de defesa em cada formulário. O componente nunca mais renderiza um
objeto.

### Aplicado em todos os call sites

Substituído `setError(data.error ?? 'fallback')` por
`setError(getApiErrorMessage(data.error, 'fallback'))` em:

- `src/app/(auth)/login/login-form.tsx`
- `src/components/workshops/workshop-form.tsx`
- `src/components/students/student-form.tsx`
- `src/components/themes/theme-form.tsx`
- `src/components/attendances/attendance-manager.tsx`
- `src/components/certificates/emit-certificate-button.tsx`

---

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/lib/api-error.ts` | **(novo)** helper `getApiErrorMessage` |
| `src/app/(auth)/login/login-form.tsx` | usa o helper |
| `src/components/workshops/workshop-form.tsx` | usa o helper (salvar e excluir) |
| `src/components/students/student-form.tsx` | usa o helper (salvar e excluir) |
| `src/components/themes/theme-form.tsx` | usa o helper |
| `src/components/attendances/attendance-manager.tsx` | usa o helper |
| `src/components/certificates/emit-certificate-button.tsx` | usa o helper |
| `tests/unit/lib/api-error.test.ts` | **(novo)** 6 casos do helper |

---

## Testes

```
api-error.test.ts — getApiErrorMessage (6 casos)
  ✅ retorna a própria string quando o erro já é texto
  ✅ extrai a primeira mensagem de fieldErrors de um erro Zod flatten
  ✅ prioriza formErrors quando presentes
  ✅ usa o fallback quando o erro é um objeto Zod sem mensagens
  ✅ usa o fallback quando o erro é undefined
  ✅ usa o fallback quando o erro é um objeto desconhecido
```

Suíte completa após o fix: **113 testes verdes**, lint e build limpos.

---

## Observação / follow-up

O fix normaliza apenas a **exibição**. O formulário de login continua sem validação Zod no
cliente; com a correção, as mensagens de validação do servidor passam a aparecer de forma
legível em vez de quebrar a tela. Adicionar validação client-side ao login é um follow-up
opcional.
