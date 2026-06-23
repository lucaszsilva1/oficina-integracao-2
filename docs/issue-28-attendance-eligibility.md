# Issue #28 — Regra de 75% de presença (elegibilidade para certificado)

**Branch:** `feature/issue-28-attendance-eligibility` (mergeada via PR #34, base `main`)
**Data:** 2026-06-22
**Sprint:** 2 (Fase 1)

---

## Contexto

Segunda metade da regra de certificação do Sprint 2 (CLAUDE.md §21, decisão 1): um
certificado só pode ser emitido para aluno com **≥ 75% de presença** na oficina. A issue #27
já adicionou `Workshop.totalClasses`; faltava saber **quantas aulas** o aluno frequentou e
bloquear a emissão abaixo do limiar.

No Sprint 1 o `Attendance` é binário — um único `status PRESENT|ABSENT` por (oficina, aluno),
representado por um checkbox no `AttendanceManager`. Um checkbox não expressa "7 de 10 aulas",
então a regra de 75% exigiu um novo dado de contagem.

### Decisões de escopo alinhadas antes de codar

1. **Manter ambos** os campos — `status` continua (marca geral, dirige a UI) e adiciona-se
   `presentCount Int @default(0)` ao `Attendance` (gatekeeping do certificado). Não substituir
   `status`.
2. **Escopo: modelo + helper + gating.** A UI granular para registrar "X de N aulas" fica como
   follow-up; nesta issue a contagem é derivada do `status` por uma ponte de backend.

---

## Critérios de aceite e resultado

| Critério | Resultado |
|---|---|
| Helper puro `isEligibleForCertificate(presentCount, totalClasses)` testado isoladamente | ✅ `certificate.eligibility.ts` com `ATTENDANCE_THRESHOLD = 0.75` |
| Bordas cobertas: 0%, exatamente 75%, abaixo de 75% | ✅ 0%, 3/4=75%, 7/10=70%, 8/10=80%, 100%, guarda `total=0` |
| `certificate.service` bloqueia emissão para aluno inelegível | ✅ `ConflictError` (409) quando `< 75%` |
| Testes unitários cobrindo elegível e inelegível | ✅ helper + service + derivação de `presentCount` |
| Mensagem de erro clara | ✅ "Aluno não atingiu 75% de presença para emitir certificado" |

---

## Decisões tomadas

### Helper puro e isolado em `certificate.eligibility.ts`

A regra de elegibilidade é uma função pura, sem dependência de Prisma ou HTTP:

```ts
export const ATTENDANCE_THRESHOLD = 0.75
export function isEligibleForCertificate(presentCount: number, totalClasses: number): boolean {
  if (totalClasses <= 0) return false
  return presentCount / totalClasses >= ATTENDANCE_THRESHOLD
}
```

**Por quê:** funções de regra de negócio puras são triviais de testar em todas as bordas sem
mocks (CLAUDE.md §18). O limiar fica numa constante exportada, evitando número mágico
espalhado. A guarda `totalClasses <= 0` previne divisão por zero.

### Gating no `certificate.service`, não na API Route nem no repository

A checagem de elegibilidade entra em `createCertificate`, após as validações de permissão e
antes de gerar o número do certificado:

```ts
if (!isEligibleForCertificate(attendance.presentCount, attendance.workshop.totalClasses)) {
  throw new ConflictError('Aluno não atingiu 75% de presença para emitir certificado')
}
```

**Por quê:** lei das camadas (CLAUDE.md §6) — regra de negócio mora no service e lança erro de
domínio (`ConflictError`, 409), consistente com as demais regras já existentes do módulo
(ABSENT, certificado duplicado). O repository apenas passou a incluir `totalClasses` no
`select` do workshop.

### Manter `status` **e** adicionar `presentCount` (aditivo)

`Attendance` ganha `presentCount Int @default(0)`. O `status` binário permanece intacto e
continua dirigindo o checkbox da UI; `presentCount` serve exclusivamente ao cálculo de 75%.

**Por quê:** substituir `status` reabriria os módulos de presença (#8) e certificado (#9) e
seus testes. A abordagem aditiva tem blast radius menor e preserva o comportamento atual.

### Ponte backend `status → presentCount` (sem UI)

Enquanto não existe a UI granular de contagem por aula, a contagem é derivada do status no
momento de salvar a presença: `PRESENT ⇒ presentCount = totalClasses` (100%, elegível),
`ABSENT ⇒ 0`.

```ts
function presentCountFor(status: AttendanceStatus, totalClasses: number): number {
  return status === 'PRESENT' ? totalClasses : 0
}
```

**Por quê:** sem essa ponte, `presentCount` nasceria sempre `0` e a regra de 75% tornaria
**todos** inelegíveis, quebrando a emissão de certificado existente. A ponte mantém o
comportamento do Sprint 1 (aluno PRESENT recebe certificado) e deixa o gating correto e
"dormente" até a UI granular existir. É lógica de backend — não viola a decisão de adiar a UI.

### `presentCount` é sempre derivado no servidor, nunca recebido do cliente

O `attendance.schema.ts` não mudou: o cliente continua enviando apenas `{ studentId, status }`.
O `presentCount` é calculado no service.

**Por quê:** valores que governam regra de negócio nunca vêm do body do request (CLAUDE.md §10,
§13). O cliente não pode forjar elegibilidade.

### Migration com backfill dos registros existentes

A migration adiciona a coluna e atualiza os registros `PRESENT` já gravados para
`presentCount = totalClasses`:

```sql
ALTER TABLE "attendances" ADD COLUMN "presentCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "attendances" a
SET "presentCount" = w."totalClasses"
FROM "workshops" w
WHERE a."workshopId" = w."id" AND a."status" = 'PRESENT';
```

**Por quê:** sem o backfill, presenças confirmadas no Sprint 1 ficariam com `presentCount = 0`
e perderiam a elegibilidade. O `UPDATE` alinha o histórico à nova ponte.

---

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/modules/certificates/certificate.eligibility.ts` | **(novo)** helper puro + `ATTENDANCE_THRESHOLD` |
| `src/modules/certificates/certificate.service.ts` | Gating de 75% em `createCertificate` |
| `src/modules/certificates/certificate.repository.ts` | `totalClasses` no `select` do workshop |
| `prisma/schema.prisma` | Campo `presentCount Int @default(0)` no `Attendance` |
| `prisma/migrations/20260622234429_add_present_count_to_attendance/migration.sql` | Coluna + backfill |
| `src/modules/attendances/attendance.service.ts` | Ponte `status → presentCount` em save e update |
| `src/modules/attendances/attendance.repository.ts` | `upsertAttendances`/`updateAttendanceStatus` gravam `presentCount` |
| `src/modules/attendances/attendance.types.ts` | `presentCount: number` em `AttendanceWithStudent` |
| `tests/unit/modules/certificates/certificate.eligibility.test.ts` | **(novo)** 7 testes do helper |
| `tests/unit/modules/certificates/certificate.service.test.ts` | Fixture + teste de inelegível |
| `tests/unit/modules/attendances/attendance.service.test.ts` | Teste da derivação de `presentCount` |

---

## Fluxo

```
Registro de presença (ponte status → presentCount)
  saveAttendances(workshopId, items, actor)
    → findWorkshopWithAttendances → workshop.totalClasses
    → items.map: presentCount = status === 'PRESENT' ? totalClasses : 0
    → upsertAttendances → grava status + presentCount

Emissão de certificado (gating de 75%)
  POST /api/workshops/[id]/certificates → createCertificate(attendanceId, actor)
    → findAttendanceWithCertificate
        → inclui workshop { id, professorId, totalClasses } e presentCount
    → NotFoundError se attendance não existe
    → ConflictError se status === 'ABSENT'
    → ConflictError se certificate !== null (já emitido)
    → ForbiddenError se TUTOR
    → ForbiddenError se PROFESSOR não-dono
    → ConflictError se !isEligibleForCertificate(presentCount, totalClasses)  ← NOVO
    → crypto.randomUUID() → createCertificateInDb
```

---

## Testes

```
certificate.eligibility.test.ts — isEligibleForCertificate (7 casos)
  ✅ expõe o limiar de 75% (ATTENDANCE_THRESHOLD === 0.75)
  ✅ retorna false para 0% de presença
  ✅ retorna true para exatamente 75% (3 de 4)
  ✅ retorna false logo abaixo de 75% (7 de 10 = 70%)
  ✅ retorna true acima de 75% (8 de 10 = 80%)
  ✅ retorna true para 100% de presença
  ✅ retorna false quando totalClasses é 0 (guarda de divisão)

certificate.service.test.ts — createCertificate
  ✅ lança ConflictError se aluno não atingiu 75% de presença (5 de 10)

attendance.service.test.ts — saveAttendances
  ✅ deriva presentCount a partir do status (PRESENT = totalClasses, ABSENT = 0)
```

Suíte completa após a issue: **107 testes verdes**, lint e build limpos.

---

## Nota de processo

O primeiro PR desta issue (#33) foi criado **empilhado** sobre a branch da issue #27 (que
ainda não estava em `main`). Ao mergear, os commits foram para a branch do #27 em vez da
`main`. A correção foi recriar o trabalho como **PR #34** (base `main`, commit cherry-pickado).
Lição registrada: em fluxo solo sequencial, mergear a dependência em `main` antes de branchar
a próxima issue — evitar PRs empilhados.

---

## Fora do escopo (próximas issues / follow-up)

| Funcionalidade | Issue |
|---|---|
| Página HTML imprimível do certificado | #29 |
| UI granular para registrar quantas aulas o aluno frequentou (substitui a ponte) | follow-up |
| Indicador de progresso de presença por aluno | diferencial Sprint 2 |
| Número do certificado legível em vez de UUID | questão em aberto (#29) |
