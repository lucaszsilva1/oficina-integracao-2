# Issue #27 — Adicionar `totalClasses` no Workshop

**Branch:** `feature/issue-27-workshop-total-classes`
**Data:** 2026-06-22
**Sprint:** 2 (Fase 1)

---

## Contexto

Primeira issue do Sprint 2. A decisão de escopo 1 do Sprint (CLAUDE.md §21) estabelece que
uma oficina pode ter até 10 aulas e que o aluno precisa de **75% de presença** para receber
certificado. Para calcular esse percentual é preciso saber o total de aulas de cada oficina.

Até então o `Workshop` não tinha esse dado. Esta issue adiciona o campo `totalClasses` e é
**pré-requisito** da issue #28 (regra de 75%), que consome `totalClasses` no cálculo de
elegibilidade.

Mudança puramente aditiva: nenhum comportamento existente é alterado, apenas um novo campo
com valor padrão `1`.

---

## Critérios de aceite e resultado

| Critério | Resultado |
|---|---|
| Campo `totalClasses` no schema do Prisma com `@default(1)` | ✅ `totalClasses Int @default(1)` no model `Workshop` |
| Migration aplicada sem erros | ✅ `20260622205335_add_total_classes_to_workshop` |
| Validação Zod: `totalClasses` entre 1 e 10 | ✅ `z.coerce.number().int().min(1).max(10)` |
| Formulário de criação/edição inclui o campo | ✅ Input numérico "Número de aulas" no `WorkshopForm` |
| Testes unitários cobrindo o novo campo | ✅ `workshop.schema.test.ts` + passthrough no `workshop.service.test.ts` |

---

## Decisões tomadas

### `totalClasses` com `@default(1)` em vez de obrigatório sem default

O campo entra com padrão `1`. Oficinas já existentes (e qualquer criação que não informe o
valor) assumem uma única aula.

**Por quê:** evita migration destrutiva e mantém compatibilidade com os dados do Sprint 1.
Uma oficina de aula única é o caso mais simples e um padrão seguro.

### Validação do intervalo (1 a 10) centralizada no schema Zod do módulo

A regra "1 a 10 aulas" vive em um único `totalClassesSchema` reutilizado por
`createWorkshopSchema` (com `.default(1)`) e `updateWorkshopSchema` (com `.optional()`).

```ts
const totalClassesSchema = z.coerce
  .number({ invalid_type_error: 'Número de aulas inválido' })
  .int('Número de aulas deve ser inteiro')
  .min(1, 'Número de aulas deve ser ao menos 1')
  .max(10, 'Número de aulas não pode exceder 10')
```

**Por quê:** segue a estratégia de validação do projeto (CLAUDE.md §8) — a estrutura é
validada na borda (API Route / formulário) via Zod, não no service. Centralizar evita
duplicação e divergência entre create e update.

### `z.coerce.number()` para aceitar o valor vindo do formulário como string

O input HTML envia `totalClasses` como string. O `z.coerce.number()` converte antes de validar.

**Por quê:** o mesmo schema serve a borda HTTP e o formulário client, sem conversão manual
espalhada.

### Service não revalida o campo — apenas repassa

`createWorkshop`/`updateWorkshop` não verificam o intervalo de `totalClasses`; recebem o dado
já validado e o repassam ao repository via `...input`.

**Por quê:** lei das camadas (CLAUDE.md §6) — o service assume dados estruturados e cuida de
regra de negócio, não de validação de formato. O teste do service garante apenas o
*passthrough* do campo ao `prisma.workshop.create`.

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `prisma/schema.prisma` | Campo `totalClasses Int @default(1)` no model `Workshop` |
| `prisma/migrations/20260622205335_add_total_classes_to_workshop/migration.sql` | `ALTER TABLE ... ADD COLUMN "totalClasses"` |
| `src/modules/workshops/workshop.schema.ts` | `totalClassesSchema` em create (default 1) e update (opcional) |
| `src/modules/workshops/workshop.types.ts` | `totalClasses: number` no tipo `Workshop` |
| `src/components/workshops/workshop-form.tsx` | Input numérico "Número de aulas" (min 1, max 10) |
| `tests/unit/modules/workshops/workshop.schema.test.ts` | **(novo)** validação de limites do campo |
| `tests/unit/modules/workshops/workshop.service.test.ts` | Fixture e teste de passthrough do `totalClasses` |

---

## Fluxo

```
WorkshopForm (Client Component)
  → input "Número de aulas" (number, min=1, max=10, default 1)
  → FormData.get('totalClasses') (string)
  → createWorkshopSchema.safeParse(input)
      → totalClassesSchema: coerce → int → 1..10 → default 1
  → fetch POST/PUT /api/workshops

API Route /api/workshops
  → createWorkshopSchema.safeParse(body) → 400 se totalClasses fora de 1..10
  → workshopService.create(parsed.data, caller)
      → repoCreate({ ...input, professorId }) — totalClasses incluído
  → prisma.workshop.create — coluna totalClasses persistida
```

---

## Testes

```
workshop.schema.test.ts — createWorkshopSchema (totalClasses)
  ✅ aceita totalClasses dentro do intervalo (1 a 10)
  ✅ assume 1 quando totalClasses é omitido
  ✅ aceita os limites 1 e 10
  ✅ rejeita totalClasses abaixo de 1
  ✅ rejeita totalClasses acima de 10
  ✅ rejeita totalClasses não inteiro

workshop.schema.test.ts — updateWorkshopSchema (totalClasses)
  ✅ aceita totalClasses ausente (campo opcional)
  ✅ aceita totalClasses válido
  ✅ rejeita totalClasses fora do intervalo

workshop.service.test.ts — createWorkshop
  ✅ repassa totalClasses ao repository
```

Suíte completa após a issue: **98 testes verdes**, lint e build limpos.

---

## Fora do escopo (próximas issues)

| Funcionalidade | Issue |
|---|---|
| Regra de 75% de presença usando `totalClasses` | #28 |
| Página HTML imprimível do certificado | #29 |
| Exibir `totalClasses` na listagem/detalhe da oficina | melhoria futura |
| UI para registrar presença por aula (contagem granular) | follow-up de #28 |
