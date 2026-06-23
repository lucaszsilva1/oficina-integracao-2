# Issue #29 — Página HTML imprimível do certificado

**Branch:** `feature/issue-29-certificate-print` (PR #35, base `main`)
**Data:** 2026-06-23
**Sprint:** 2 (Fase 1)
**Depende de:** #28 (regra de 75% / elegibilidade)

---

## Contexto

Última issue do trio de certificação do Sprint 2 (CLAUDE.md §21, decisão 2). A decisão de
escopo foi a **Opção A**: certificado sem PDF, entregue como uma **página HTML pública e
imprimível**, mantendo a entidade `Certificate` persistida (preserva auditoria e os 15 testes
do `certificate.service.test.ts` do Sprint 1).

O link do certificado precisa ser **enviável diretamente ao aluno**, que **não possui login**
no sistema (alunos são crianças de escolas parceiras — CLAUDE.md §22). Por isso a rota é
pública: é uma **exceção consciente** ao padrão de autorização (CLAUDE.md §10), documentada no
código e aqui.

### Decisões de escopo alinhadas antes de codar

1. **Server Component público**, sem leitura de cookie/token. A página lê o banco via
   service → repository (lei das camadas preservada).
2. **Estilo autossuficiente** com `@media print` embutido na própria página. Não depende de
   CSS global (que ainda não existe e chega na #30).
3. **Conteúdo completo** do certificado (alinhado com o usuário): nome do aluno, oficina,
   tema, data, nº de aulas, professor, número (UUID) e data de emissão.

---

## Critérios de aceite e resultado

| Critério | Resultado |
|---|---|
| Rota `/certificates/[id]/print` acessível sem autenticação | ✅ liberada no middleware via pattern |
| Layout específico, sem header/sidebar do sistema | ✅ página autossuficiente, sem chrome |
| `@media print` aplicado para impressão limpa | ✅ bloco `@media print` remove sombra/margens |
| 404 quando o certificado não existe | ✅ `NotFoundError` → `notFound()` |

---

## Decisões tomadas

### Rota pública — exceção consciente ao §10

A página `src/app/certificates/[id]/print/page.tsx` **não** lê cookie nem valida token, ao
contrário das demais páginas protegidas (ex.: `/workshops/[id]/certificates`).

**Por quê:** o aluno não tem conta. Exigir login inviabilizaria o caso de uso (enviar o link
direto). A exceção é restrita a uma rota de **leitura** de um recurso já emitido, identificado
por um `id` cuid não enumerável. Documentada em comentário no topo do arquivo.

### `export const dynamic = 'force-dynamic'`

A página acessa o Prisma mas **não** lê `cookies()`/`headers()`. Sem o `force-dynamic`, o
Next.js 14 tentaria pré-renderizar estaticamente no build e falharia sem banco (hurdle
CLAUDE.md §23).

### Liberação no middleware via pattern (não match exato)

O `middleware.ts` usava `PUBLIC_PATHS.includes(pathname)` — match exato, que não cobre uma
rota dinâmica como `/certificates/{id}/print`. Adicionado `PUBLIC_PATH_PATTERNS`:

```ts
const PUBLIC_PATH_PATTERNS = [/^\/certificates\/[^/]+\/print$/]

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
  )
}
```

**Por quê:** sem isso, o middleware redirecionaria a rota pública para `/login` (não há cookie),
quebrando o critério de aceite "acessível sem autenticação". O regex casa exatamente o segmento
`print` para não liberar nada além do necessário.

### Service monta um DTO de exibição (mantém-se agnóstico de HTTP)

`getCertificateForPrint(id)` busca o certificado com relações completas e retorna um
`CertificatePrintData` plano. Lança `NotFoundError` se não existir — a página converte em 404
via `notFound()`. O service não conhece HTTP (lei das camadas, §6).

```ts
const cert = await getCertificateForPrint(params.id).catch((error) => {
  if (error instanceof NotFoundError) notFound()
  throw error
})
```

### Query dedicada no repository

`findCertificateForPrint(id)` faz um único `findUnique` com `include` aninhado
(attendance → student, workshop → theme, professor). A `findCertificateById` existente
(usada pelo delete) retorna só o certificado cru e foi mantida.

### Estilo escopado com `@media print`

Os estilos vão num `<style>` embutido na página, com uma classe raiz `.certificate-page`.
O bloco `@media print` zera o fundo/sombra e remove o padding de tela para a impressão.

---

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/app/certificates/[id]/print/page.tsx` | **(novo)** Server Component público + estilos `@media print` |
| `src/modules/certificates/certificate.repository.ts` | **(novo método)** `findCertificateForPrint` com relações completas |
| `src/modules/certificates/certificate.service.ts` | **(novo método)** `getCertificateForPrint` → `CertificatePrintData` |
| `src/modules/certificates/certificate.types.ts` | **(novo tipo)** `CertificatePrintData` |
| `src/middleware.ts` | `PUBLIC_PATH_PATTERNS` libera a rota dinâmica sem auth |
| `tests/unit/modules/certificates/certificate.service.test.ts` | 2 testes de `getCertificateForPrint` |

---

## Fluxo

```
GET /certificates/[id]/print (page.tsx — Server Component público)
  middleware: isPublicPath('/certificates/{id}/print') === true → NextResponse.next()
  → getCertificateForPrint(id)
      → findCertificateForPrint(id)
          → certificate.findUnique WHERE id
             include attendance → student.name
                                 → workshop { title, date, totalClasses,
                                              theme.name, professor.name }
      → NotFoundError se null
      → mapeia para CertificatePrintData
  → NotFoundError ⇒ notFound() (404)
  → renderiza o certificado + <style> com @media print
```

---

## Testes

```
certificate.service.test.ts — getCertificateForPrint (2 casos)
  ✅ retorna os dados completos do certificado para impressão (mapeamento do DTO)
  ✅ lança NotFoundError se certificado não existe
```

A página pública (Server Component) é validada manualmente; a regra crítica (404 +
mapeamento do DTO) fica coberta no service, conforme a estratégia de testes (CLAUDE.md §18).

Suíte completa após a issue: **115 testes verdes**, lint e build limpos
(`/certificates/[id]/print` → *server-rendered on demand*).

### Verificação manual (E2E)

1. `docker compose up -d` + `npm run dev`.
2. Logado como `professor@ellp.dev`, emitir/obter um certificado e copiar o `id`.
3. Abrir `/certificates/{id}/print` **em aba anônima** → certificado renderizado sem chrome.
4. `Ctrl+P` → preview de impressão limpo.
5. `/certificates/id-inexistente/print` → 404.

---

## Fora do escopo (próximas issues / follow-up)

| Funcionalidade | Issue |
|---|---|
| Estilização global das páginas (isolar esta rota do chrome global) | #30 |
| Deploy | #31 |
| Número do certificado legível em vez de UUID (alinhar com o professor) | questão em aberto |
| Link "Imprimir" a partir da lista de certificados | follow-up |
