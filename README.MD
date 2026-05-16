# Controle de Oficinas — ELLP / UTFPR

![CI](https://github.com/lucaszsilva1/oficina-integracao-2/actions/workflows/ci.yml/badge.svg)

Sistema web para gerenciamento de oficinas do projeto de extensão ELLP (Ensino Lúdico de
Lógica e Programação) da UTFPR — Campus Cornélio Procópio.

---

## Stack

| Camada         | Tecnologia                      |
| -------------- | ------------------------------- |
| Front-end      | React via Next.js 14 App Router |
| Back-end       | Next.js API Routes              |
| Linguagem      | TypeScript 5                    |
| ORM            | Prisma 5                        |
| Banco de dados | PostgreSQL 15                   |
| Testes         | Vitest                          |
| Validação      | Zod                             |
| Autenticação   | JWT manual (jose + bcryptjs)    |
| CI/CD          | GitHub Actions                  |

---

## Arquitetura em Camadas

```
[Server Component / Client Component]   apresentação, sem lógica de negócio
                ↓
          [API Route]                   recebe request, valida auth, chama service
                ↓
           [Service]                    regras de negócio, orquestra repositories
                ↓
         [Repository]                   acesso ao banco via Prisma
                ↓
      [Prisma / PostgreSQL]             persistência
```

**Regras:**
- API Route nunca acessa o Prisma diretamente — usa Repository
- Service nunca importa `next/headers` nem conceitos HTTP — é agnóstico
- Repository nunca contém regras de negócio — só queries
- Componente React nunca contém regras de negócio — só UI
- Service nunca lança erros HTTP — lança erros de domínio (`NotFoundError`, `ConflictError`, `ForbiddenError`)

---

## Diagrama de Entidades

```mermaid
erDiagram
    User {
        string id
        string name
        string email
        string password
        Role   role
    }
    Theme {
        string id
        string name
        string slug
        string description
    }
    Workshop {
        string   id
        string   title
        DateTime date
        string   location
        string   themeId
        string   professorId
    }
    Student {
        string id
        string name
        string school
        int    age
    }
    Attendance {
        string           id
        string           workshopId
        string           studentId
        AttendanceStatus status
    }
    Certificate {
        string   id
        string   attendanceId
        string   number
        DateTime issuedAt
    }

    Theme     ||--o{ Workshop    : "tema"
    User      ||--o{ Workshop    : "professor"
    Workshop  ||--o{ Attendance  : "presenças"
    Student   ||--o{ Attendance  : "aluno"
    Attendance ||--o| Certificate : "certificado"
```

**Enums:**
- `Role`: `ADMIN` | `PROFESSOR` | `TUTOR`
- `AttendanceStatus`: `PRESENT` | `ABSENT`

---

## Módulos e Responsabilidades

| Módulo         | Caminho                      | Responsabilidade                                      |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| `workshops`    | `src/modules/workshops/`     | CRUD de oficinas, validação de dono, cascade delete   |
| `themes`       | `src/modules/themes/`        | CRUD de temas, slug único                             |
| `students`     | `src/modules/students/`      | CRUD de alunos, busca por nome                        |
| `attendances`  | `src/modules/attendances/`   | Registro de presença em bulk via upsert, permissões   |
| `certificates` | `src/modules/certificates/`  | Emissão de certificado UUID, regras de permissão      |

Cada módulo contém: `*.service.ts` · `*.repository.ts` · `*.schema.ts` · `*.types.ts`

---

## Estrutura de Pastas

```
oficina-integracao-2/
├── .github/workflows/ci.yml        ← lint + testes em cada push
├── prisma/
│   ├── schema.prisma               ← definição do banco
│   ├── migrations/                 ← histórico de migrations
│   └── seed.ts                     ← dados iniciais para dev
├── src/
│   ├── app/                        ← rotas Next.js (App Router)
│   │   ├── (auth)/login/           ← página de login
│   │   ├── workshops/              ← listagem, detalhe, presença, certificados
│   │   ├── themes/                 ← listagem, criação, edição
│   │   ├── students/               ← listagem, criação, edição
│   │   └── api/                    ← API Routes (back-end)
│   │       ├── auth/               ← login / logout
│   │       ├── workshops/          ← CRUD + /[id]/attendances + /[id]/certificates
│   │       ├── themes/             ← CRUD
│   │       ├── students/           ← CRUD + busca
│   │       ├── attendances/[id]/   ← PATCH status individual
│   │       └── certificates/[id]/  ← DELETE (admin)
│   ├── modules/                    ← lógica de negócio por domínio
│   │   ├── workshops/
│   │   ├── themes/
│   │   ├── students/
│   │   ├── attendances/
│   │   └── certificates/
│   ├── lib/
│   │   ├── prisma.ts               ← instância singleton do PrismaClient
│   │   ├── auth.ts                 ← signToken, verifyToken, hashPassword
│   │   └── errors.ts               ← AppError, NotFoundError, ConflictError, ForbiddenError
│   └── components/
│       ├── attendances/            ← AttendanceManager, StudentSelector
│       ├── certificates/           ← CertificateList, EmitCertificateButton
│       ├── workshops/              ← WorkshopForm
│       ├── students/               ← StudentForm, StudentSearch
│       └── themes/                 ← ThemeForm
└── tests/
    └── unit/modules/               ← services com mocks do Prisma
        ├── workshops/
        ├── themes/
        ├── students/
        ├── attendances/
        └── certificates/
```

---

## Papéis e Permissões

| Ação                 | ADMIN | PROFESSOR dono | PROFESSOR outro | TUTOR |
| -------------------- | ----- | -------------- | --------------- | ----- |
| Criar/editar tema    | ✅    | ✅             | ✅              | ❌    |
| Criar/editar oficina | ✅    | ✅             | ❌              | ❌    |
| Cadastrar aluno      | ✅    | ✅             | ✅              | ✅    |
| Registrar presença   | ✅    | ✅             | ❌              | ✅    |
| Emitir certificado   | ✅    | ✅             | ❌              | ❌    |
| Excluir certificado  | ✅    | ❌             | ❌              | ❌    |

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Instalação

```bash
git clone https://github.com/lucaszsilva1/oficina-integracao-2.git
cd oficina-integracao-2
npm install
cp .env.example .env.local
# edite .env.local com suas credenciais
```

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/oficina_ellp"
DATABASE_URL_TEST="postgresql://usuario:senha@localhost:5432/oficina_ellp_test"
JWT_SECRET="gerar com: openssl rand -base64 32"
```

## Banco de Dados

```bash
npx prisma migrate dev       # aplica migrations
npx prisma db seed           # popula banco com dados de dev
npx prisma studio            # interface visual
```

---

## Testes

O projeto usa **Vitest** com a pirâmide: testes unitários de service (mocks do Prisma).

```bash
# Rodar todos os testes
npm test

# Modo watch
npm test -- --watch

# Relatório de cobertura (abre em coverage/index.html)
npm test -- --coverage
```

Cobertura mínima configurada no CI: **80% de statements, branches, functions e lines** nos services.

Para rodar apenas um módulo:

```bash
npm test -- tests/unit/modules/certificates/
npm test -- tests/unit/modules/attendances/
```

---

## Desenvolvimento

```bash
npm run dev      # servidor em localhost:3000
npm run build    # build de produção
npm run lint     # ESLint
npm run format   # Prettier
```
