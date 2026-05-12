# CLAUDE.md

# Controle de Oficinas — Projeto ELLP / UTFPR

# Oficina de Integração 2 — ES47C/IF66K

> Documento vivo. Atualizar a cada decisão nova, hurdle descoberto ou padrão estabelecido.
> O agente lê este documento inteiro antes de cada sessão. Mantenha-o preciso.

---

## 1. Visão Geral do Projeto

Sistema web para gerenciamento de oficinas do projeto de extensão ELLP (Ensino Lúdico de
Lógica e Programação) da UTFPR — Campus Cornélio Procópio.

**Repositório:** https://github.com/lucaszsilva1/oficina-integracao-2

**Problema:** controle manual de oficinas, voluntários, alunos e certificados.

**Solução:** sistema web com cadastro, presença, emissão de certificados e relatórios.

**Definição de pronto:** funcionalidades implementadas com testes automatizados, CI verde,
arquitetura respeitada, issues fechadas com commits rastreáveis, demonstrável em vídeo de 5min.

---

## 2. Stack Tecnológica

| Camada         | Tecnologia                     | Versão      |
| -------------- | ------------------------------ | ----------- |
| Front-end      | React (via Next.js App Router) | Next.js 14+ |
| Back-end       | Next.js API Routes             | Next.js 14+ |
| Linguagem      | TypeScript                     | 5+          |
| ORM            | Prisma                         | 5+          |
| Banco de dados | PostgreSQL                     | 15+         |
| Testes         | Jest + Testing Library         | latest      |
| Validação      | Zod                            | latest      |
| Lint           | ESLint + Prettier              | latest      |
| CI/CD          | GitHub Actions                 | —           |
| Autenticação   | NextAuth.js                    | v5          |

---

## 3. Estrutura de Pastas

```
oficina-integracao-2/
├── .github/
│   └── workflows/
│       └── ci.yml                  ← lint + testes em cada push
├── prisma/
│   ├── schema.prisma               ← definição do banco
│   ├── migrations/                 ← histórico de migrations
│   └── seed.ts                     ← dados iniciais para dev
├── src/
│   ├── app/                        ← rotas Next.js (App Router)
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── workshops/
│   │   │   ├── page.tsx            ← Server Component (listagem)
│   │   │   └── [id]/page.tsx       ← Server Component (detalhe)
│   │   ├── themes/page.tsx
│   │   ├── students/page.tsx
│   │   └── api/                    ← API Routes (back-end)
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── workshops/route.ts
│   │       ├── themes/route.ts
│   │       ├── students/route.ts
│   │       ├── attendance/route.ts
│   │       └── certificates/route.ts
│   ├── modules/                    ← lógica de negócio por domínio
│   │   ├── workshops/
│   │   │   ├── workshop.service.ts
│   │   │   ├── workshop.repository.ts
│   │   │   ├── workshop.schema.ts  ← schemas Zod do módulo
│   │   │   └── workshop.types.ts
│   │   ├── themes/
│   │   │   ├── theme.service.ts
│   │   │   ├── theme.repository.ts
│   │   │   ├── theme.schema.ts
│   │   │   └── theme.types.ts
│   │   ├── students/
│   │   │   ├── student.service.ts
│   │   │   ├── student.repository.ts
│   │   │   ├── student.schema.ts
│   │   │   └── student.types.ts
│   │   ├── attendance/
│   │   │   ├── attendance.service.ts
│   │   │   ├── attendance.repository.ts
│   │   │   ├── attendance.schema.ts
│   │   │   └── attendance.types.ts
│   │   └── certificates/
│   │       ├── certificate.service.ts
│   │       ├── certificate.repository.ts
│   │       ├── certificate.schema.ts
│   │       └── certificate.types.ts
│   ├── lib/
│   │   ├── prisma.ts               ← instância singleton do PrismaClient
│   │   ├── auth.ts                 ← configuração NextAuth
│   │   └── errors.ts               ← classes de erro de domínio
│   └── components/                 ← componentes React reutilizáveis
│       ├── ui/                     ← botões, inputs, cards genéricos
│       └── layout/                 ← header, sidebar, nav
├── tests/
│   ├── unit/                       ← testes de services e repositories
│   │   ├── workshops/
│   │   ├── themes/
│   │   ├── students/
│   │   ├── attendance/
│   │   └── certificates/
│   └── integration/                ← testes de API Routes com banco real
├── .env.example                    ← variáveis necessárias (sem valores reais)
├── jest.config.ts
├── next.config.ts
└── README.md
```

---

## 4. Domínio e Entidades

### Entidades definidas

```
User            → quem acessa o sistema (Professor, Tutor, Admin)
Theme           → assunto de uma oficina (ex: Scratch, Lógica)
Workshop        → a oficina em si (data, local, tema, professor)
Student         → aluno participante (sem login — só registro)
Attendance      → presença de um aluno em uma oficina
Certificate     → registro de emissão de certificado (Sprint 1: sem PDF)
```

### Relações

```
Theme ──< Workshop >── User (professor responsável)
Workshop >──< User (tutores — relação N:N)
Workshop ──< Attendance >── Student
Attendance ──< Certificate
```

### Regras de negócio críticas

- Um aluno não pode ter presença duplicada na mesma oficina
- Certificado só pode ser emitido para presença com status PRESENT
- Certificado não pode ser emitido duplicado para a mesma presença
- Apenas PROFESSOR e ADMIN podem criar/editar oficinas e temas
- TUTOR pode registrar presença
- Número do certificado é sequencial e gerado pelo sistema

---

## 5. Papéis e Permissões

| Ação                 | ADMIN | PROFESSOR | TUTOR |
| -------------------- | ----- | --------- | ----- |
| Criar/editar tema    | ✅    | ✅        | ❌    |
| Criar/editar oficina | ✅    | ✅        | ❌    |
| Cadastrar aluno      | ✅    | ✅        | ✅    |
| Registrar presença   | ✅    | ✅        | ✅    |
| Emitir certificado   | ✅    | ✅        | ❌    |
| Ver relatórios       | ✅    | ✅        | ❌    |

---

## 6. Arquitetura em Camadas

```
[Server Component / Client Component]   ← apresentação, sem lógica de negócio
                ↓
          [API Route]                   ← recebe request, valida auth, chama service
                ↓
           [Service]                    ← regras de negócio, orquestra repositories
                ↓
         [Repository]                   ← acesso ao banco via Prisma
                ↓
      [Prisma / PostgreSQL]             ← persistência
```

### Lei das camadas — sem exceção

- API Route **nunca** acessa Prisma diretamente → usa Repository
- Service **nunca** importa `next/headers` ou qualquer conceito HTTP → é agnóstico
- Repository **nunca** contém regras de negócio → só queries
- Componente React **nunca** contém regras de negócio → só UI
- Service **nunca** lança erros HTTP (status 400, 404) → lança erros de domínio

---

## 7. Estratégia React / Next.js (Server vs Client)

Esta é uma das decisões mais importantes com Next.js App Router.
Sem regra clara, o agente coloca `"use client"` em tudo e move lógica para o frontend.

### Regra padrão

**Server Components por padrão.** `"use client"` é exceção, não regra.

### Quando usar Server Component

- Páginas que carregam dados do banco
- Composição de layout
- Renderização inicial de listas e detalhes
- Qualquer componente sem interatividade do usuário

```tsx
// page.tsx — Server Component (sem "use client")
export default async function WorkshopsPage() {
  const workshops = await workshopService.findAll();
  return <WorkshopList workshops={workshops} />;
}
```

### Quando usar Client Component

Apenas quando estritamente necessário:

- Formulários com estado controlado (useState)
- Interações do usuário (click handlers, inputs)
- Hooks React (useState, useEffect, useRouter)
- Acesso a APIs do browser

```tsx
// workshop-form.tsx — Client Component
"use client"
export function WorkshopForm() { ... }
```

### Quando usar API Routes

- Mutations (POST, PUT, DELETE) com validação e auth
- Testes de integração (mais fácil de testar que Server Actions)
- Endpoints com lógica de autorização por role

### Nunca

- `"use client"` em page.tsx sem necessidade real de interatividade
- Fetch no cliente para dados que poderiam vir do servidor
- Lógica de negócio em componentes client

---

## 8. Estratégia de Validação

Sem regra, o agente valida no frontend, valida diferente na API,
e o service recebe dados inconsistentes. Isso gera bugs difíceis de rastrear.

### Onde cada camada valida

```
Frontend    → validação de UX (feedback imediato, opcional)
API Route   → validação de entrada obrigatória com Zod (nunca confiar no cliente)
Service     → assume dados já estruturados, aplica regras de negócio
Repository  → não valida — só persiste
```

### Onde ficam os schemas Zod

Cada módulo tem seu próprio arquivo de schema:

```
src/modules/workshops/workshop.schema.ts  → createWorkshopSchema, updateWorkshopSchema
src/modules/themes/theme.schema.ts
src/modules/students/student.schema.ts
```

### Padrão de uso na API Route

```ts
const body = await request.json();
const parsed = createWorkshopSchema.safeParse(body);
if (!parsed.success) {
  return Response.json({ error: parsed.error.flatten() }, { status: 400 });
}
// parsed.data é seguro para passar ao service
const workshop = await workshopService.create(parsed.data);
```

---

## 9. Estratégia de Erros

Sem padrão, o agente lança `throw new Error()` aleatoriamente,
expõe erros internos do Prisma e cada módulo responde de forma diferente.

### Classes de erro de domínio

```ts
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Não autorizado', 401);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} não encontrado`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
```

### Regras de uso

- Services lançam erros de domínio (`NotFoundError`, `ConflictError`)
- Services **nunca** lançam erros crus do Prisma
- API Routes capturam `AppError` e convertem para HTTP response
- API Routes **nunca** expõem stack trace ou mensagem interna ao cliente

### Padrão de tratamento na API Route

```ts
try {
  const result = await workshopService.create(parsed.data);
  return Response.json(result, { status: 201 });
} catch (error) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }
  console.error('[INTERNAL ERROR]', error); // log apenas no servidor
  return Response.json({ error: 'Erro interno' }, { status: 500 });
}
```

---

## 10. Estratégia de Autorização

Autenticação (quem é você) e autorização (o que pode fazer) são responsabilidades distintas.

### Onde cada uma acontece

```
NextAuth Middleware  → bloqueia rotas não autenticadas globalmente
API Route           → verifica sessão + valida role antes de chamar service
Service             → recebe usuário autenticado como parâmetro explícito
```

### Regras

- Verificar sessão no início de toda API Route protegida
- **Nunca** confiar em role enviada pelo frontend no body do request
- Role vem sempre da sessão do servidor (`session.user.role`)
- Service recebe o usuário como parâmetro — nunca lê sessão diretamente

### Padrão na API Route

```ts
const session = await getServerSession(authOptions);

if (!session) {
  return Response.json({ error: 'Não autenticado' }, { status: 401 });
}
if (!['PROFESSOR', 'ADMIN'].includes(session.user.role)) {
  return Response.json({ error: 'Não autorizado' }, { status: 403 });
}

const result = await workshopService.create(parsed.data, session.user);
```

---

## 11. Banco de Dados para Testes

Testes de integração que usam o banco de desenvolvimento contaminam dados.
Banco de teste é isolado e controlado.

### Configuração

```bash
# .env.test (nunca commitar)
DATABASE_URL="postgresql://user:password@localhost:5432/oficina_ellp_test"
```

### Regras

- Banco PostgreSQL separado exclusivo para testes: `oficina_ellp_test`
- `beforeEach` limpa as tabelas relevantes antes de cada teste
- Seed mínimo e controlado — só o necessário para o cenário
- CI usa banco de teste em container PostgreSQL via GitHub Actions service

### Padrão de limpeza nos testes de integração

```ts
beforeEach(async () => {
  // seguir ordem inversa das dependências (FK constraints)
  await prisma.certificate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.student.deleteMany();
  await prisma.theme.deleteMany();
});
```

---

## 12. Limites de Complexidade

Com agente de IA, arquivos crescem rápido sem perceber.
O padrão do FrankMD mostra o resultado: arquivo de 5.000 linhas, 6 cirurgias de emergência.

### Limites por tipo de arquivo

| Arquivo          | Limite      | Ação quando ultrapassar                         |
| ---------------- | ----------- | ----------------------------------------------- |
| Service          | ~150 linhas | Extrair método privado ou sub-service           |
| Repository       | ~100 linhas | Extrair queries complexas para métodos nomeados |
| API Route        | ~60 linhas  | Extrair lógica para service                     |
| Componente React | ~100 linhas | Extrair sub-componentes                         |
| Schema Zod       | ~50 linhas  | Dividir por operação (create, update)           |

### Quando o agente deve parar e sinalizar

- Arquivo ultrapassando os limites acima
- Função com mais de 20 linhas
- Mais de 3 níveis de indentação
- Mesmo bloco de código aparecendo em 2 lugares diferentes

**Protocolo:** agente aponta o problema → explica o risco → propõe refactor pequeno → humano decide.

---

## 13. Anti-patterns — Nunca Fazer

```
❌ "use client" em page.tsx sem necessidade de interatividade
❌ Fetch do Prisma diretamente em componente React
❌ Service importando next/headers, cookies ou request HTTP
❌ API Route com regras de negócio (if/else de domínio)
❌ Repository com if/else de regra de negócio
❌ throw new Error() cru no service sem classe de domínio
❌ Validação Zod duplicada no frontend E no service (service não valida estrutura)
❌ Role lida do body do request (sempre da sessão)
❌ console.log commitado no código (só em debug local temporário)
❌ any no TypeScript sem comentário justificando a exceção
❌ Dois services chamando um ao outro em cadeia circular
```

---

## 14. Checklist de Pronto (Definition of Done)

Uma issue só está concluída quando **todos** os itens estão marcados.
O agente verifica esta lista antes de propor o commit final de cada issue.

```
[ ] testes escritos antes da implementação (TDD)
[ ] todos os testes passando localmente (npm test)
[ ] lint sem erros (npm run lint)
[ ] build sem erros (npm run build)
[ ] cobertura adequada nas regras de negócio do módulo
[ ] lei das camadas respeitada
[ ] erros tratados com classes de domínio
[ ] sem TODOs ou console.log soltos no código commitado
[ ] commit com mensagem no formato Conventional Commits
[ ] PR aberto linkando a issue ("Closes #N")
[ ] CI verde no GitHub Actions
```

---

## 15. Variáveis de Ambiente

```bash
# .env.local (nunca commitar — no .gitignore)
DATABASE_URL="postgresql://user:password@localhost:5432/oficina_ellp"
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/oficina_ellp_test"
NEXTAUTH_SECRET="gerar com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
# .env.example (commitar — referência sem valores reais)
DATABASE_URL=""
DATABASE_URL_TEST=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
```

---

## 16. Comandos do Projeto

```bash
# Desenvolvimento
npm run dev                  # sobe servidor local em localhost:3000

# Banco de dados
npx prisma migrate dev       # cria e aplica migration
npx prisma db seed           # popula banco com dados de dev
npx prisma studio            # interface visual do banco

# Testes
npm test                     # roda todos os testes
npm test -- --watch          # modo watch
npm test -- --coverage       # com relatório de cobertura

# Qualidade
npm run lint                 # ESLint
npm run format               # Prettier
npm run build                # build de produção (CI valida isso)
```

---

## 17. Convenções de Git

### Branches

```
main                    ← protegida, sempre estável, CI obrigatório
feature/issue-N-slug    ← uma branch por issue

Exemplos:
feature/issue-1-project-setup
feature/issue-4-authentication
feature/issue-6-workshops-crud
```

### Commits (Conventional Commits)

```
tipo(escopo): descrição curta em inglês

feat(auth): add login with email and password
feat(workshops): create workshop listing page
test(themes): add unit tests for theme service
fix(attendance): prevent duplicate attendance registration
refactor(students): extract validation to shared schema
ci: add github actions workflow
docs: update README with architecture diagram
chore(deps): add zod for input validation
```

### Fluxo por issue

```
1. Criar branch:  git checkout -b feature/issue-N-descricao
2. Desenvolver:   TDD (test → fail → implement → refactor)
3. Commits:       pequenos e frequentes
4. PR:            "Closes #N" na descrição
5. CI:            deve estar verde antes do merge
6. Merge:         issue fechada automaticamente
```

---

## 18. Estratégia de Testes

### Pirâmide adotada

```
      [integração]     ← API Routes com banco de teste PostgreSQL real
     [  unitários  ]   ← services e repositories com mocks do Prisma
```

### O que testar em cada camada

**Service (obrigatório para toda funcionalidade):**

- Fluxo feliz (happy path)
- Casos de erro (validação falha, entidade não encontrada)
- Regras de negócio (duplicata, permissão, sequência)

**Repository:**

- Queries com lógica condicional relevante

**API Route (integração):**

- Autenticação e autorização (401, 403)
- Request inválido retorna 400 com mensagem clara
- Fluxo completo feliz com banco real

### Padrão de mock do Prisma nos testes unitários

```ts
// No topo do arquivo de teste
jest.mock('../../../src/lib/prisma', () => ({
  workshop: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
```

### Cobertura mínima esperada

- Services: 85%+
- Foco em branch coverage das regras de negócio

---

## 19. Fluxo de Desenvolvimento (TDD)

Para cada funcionalidade nova, seguir esta ordem sem exceção:

```
1. Abrir a issue correspondente no GitHub
2. Criar branch: feature/issue-N-descricao
3. Discutir: entradas, saídas, validações, erros esperados
4. Escrever o teste → rodar → confirmar FALHA (red)
5. Implementar o mínimo para passar → confirmar PASSA (green)
6. Refatorar sem quebrar testes (refactor)
7. Verificar Checklist de Pronto (seção 14)
8. Commit pequeno e descritivo
9. Repetir para o próximo comportamento da mesma issue
10. PR → CI verde → merge → issue fechada
```

---

## 20. Backlog Sprint 1

| Issue | Título                                  | Status |
| ----- | --------------------------------------- | ------ |
| #1    | Configurar estrutura inicial do projeto | ⬜     |
| #2    | Configurar CI com GitHub Actions        | ✅     |
| #3    | Criar schema do banco de dados          | ⬜     |
| #4    | Autenticação — login e sessão           | ⬜     |
| #5    | CRUD de Temas de Oficina                | ⬜     |
| #6    | CRUD de Oficinas                        | ⬜     |
| #7    | CRUD de Alunos                          | ⬜     |
| #8    | Registro de Presença                    | ⬜     |
| #9    | Emissão de Certificado                  | ⬜     |
| #10   | Documentar arquitetura no README        | ⬜     |

---

## 21. Backlog Sprint 2 (planejamento inicial)

- Relatório de oficinas por período
- Relatório de presença por aluno
- Geração de certificado em PDF (stretch goal)
- Ampliação de cobertura de testes
- Ajustes apontados pelo professor no Sprint Review 1

---

## 22. Decisões Tomadas

| Data       | Decisão                                           | Razão                                                  |
| ---------- | ------------------------------------------------- | ------------------------------------------------------ |
| 2026-05-12 | Stack: Next.js + TypeScript + Prisma + PostgreSQL | Solo iniciante com React; stack produtiva e opinionada |
| 2026-05-12 | Foco: módulo Controle de Oficinas                 | Cobre todos os requisitos acadêmicos em um domínio só  |
| 2026-05-12 | Aluno sem login                                   | Alunos são crianças de escolas parceiras               |
| 2026-05-12 | Certificado sem PDF no Sprint 1                   | Reduz risco; PDF é expansão no Sprint 2                |
| 2026-05-12 | Tutor como papel de usuário                       | Tutores têm acesso ao sistema                          |
| 2026-05-12 | Server Components por padrão                      | Evita "use client" desnecessário                       |
| 2026-05-12 | Erros de domínio com classes explícitas           | Evita erros crus do Prisma na API                      |
| 2026-05-12 | Banco separado para testes                        | Evita contaminação entre dev e testes                  |
| 2026-05-12 | Schemas Zod por módulo                            | Evita validação duplicada e centralizada               |
| 2026-05-12 | Migração de Jest para Vitest                      | Melhor performance, suporte ESM nativo e DX superior   |

---

## 23. Hurdles Conhecidos

> Preencher ao longo do projeto. Cada hurdle descoberto vale um registro aqui.

- [x] gh CLI não está instalado. Criar o PR via MCP GitHub.
- [x] next.config.ts não suportado no Next.js 14
  - Solução: renomear para next.config.mjs.
- [x] ts-node ausente para jest.config.ts
  - Solução: Irrelevante após migração para Vitest.
- [x] Crash 0xC0000005 no build (Windows)
  - Sintoma: `Next.js build worker exited with code: 3221226505`.
  - Causa: Problema de concorrência nos workers do Next.js 14 no Windows.
  - Solução: Adicionado `experimental: { webpackBuildWorker: false }` no `next.config.mjs`.

---

## 24. Filosofia do Projeto

Este projeto segue o modelo de engenharia incremental de Extreme Programming
documentado por Fabio Akita:

- TDD não é opcional — é o fluxo
- Small commits não é estilo — é disciplina
- CI verde em cada commit — sem exceção
- Refactor contínuo — nunca deixar dívida acumular
- O agente sugere. O humano decide.
- Complexidade não entregue é melhor que complexidade quebrada

**Referência:** https://akitaonrails.com/2026/02/20/do-zero-a-pos-producao-em-1-semana

---

## 25. Papel do Agente IA (Claude Code)

O agente atua como:

- pair programmer — pilota o código, humano navega
- reviewer crítico — aponta problemas antes de commitar
- professor técnico — explica o porquê de cada decisão

O agente NÃO deve:

- tomar decisões de arquitetura sozinho
- gerar funcionalidades inteiras sem alinhamento prévio
- adicionar abstrações sem justificar necessidade
- over-engenheirar — se parece complexo demais, simplificar primeiro

Quando perceber arquivo crescendo além dos limites, responsabilidades misturadas
ou duplicação aparecendo: **parar, apontar, propor refactor pequeno, aguardar decisão.**
