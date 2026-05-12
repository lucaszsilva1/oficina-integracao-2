# Controle de Oficinas — ELLP / UTFPR

Sistema web para gerenciamento de oficinas do projeto de extensão ELLP (Ensino Lúdico de
Lógica e Programação) da UTFPR — Campus Cornélio Procópio.

---

## Stack Tecnológica

| Camada         | Tecnologia                      |
| -------------- | ------------------------------- |
| Front-end      | React via Next.js 14 App Router |
| Back-end       | Next.js API Routes              |
| Linguagem      | TypeScript 5                    |
| ORM            | Prisma 5                        |
| Banco de dados | PostgreSQL 15                   |
| Testes         | Vitest + Testing Library        |
| Validação      | Zod                             |
| Autenticação   | NextAuth.js v5                  |
| CI/CD          | GitHub Actions                  |

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Instalação

```bash
# Clone o repositório
git clone https://github.com/lucaszsilva1/oficina-integracao-2.git
cd oficina-integracao-2

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do banco de dados
```

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/oficina_ellp"
DATABASE_URL_TEST="postgresql://usuario:senha@localhost:5432/oficina_ellp_test"
NEXTAUTH_SECRET="gerar com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

## Banco de dados

```bash
# Aplicar migrations
npx prisma migrate dev

# Popular banco com dados de desenvolvimento
npx prisma db seed

# Interface visual do banco
npx prisma studio
```

## Comandos

```bash
# Servidor de desenvolvimento (localhost:3000)
npm run dev

# Build de produção
npm run build

# Testes
npx vitest run
npx vitest run --coverage

# Modo watch
npm run test:watch

# Lint e formatação
npm run lint
npm run format
```

---

## Estrutura de Pastas

```
oficina-integracao-2/
├── .github/workflows/      ← CI com GitHub Actions
├── prisma/                 ← schema, migrations e seed
├── src/
│   ├── app/                ← rotas Next.js (App Router)
│   │   ├── (auth)/         ← login
│   │   ├── dashboard/
│   │   ├── workshops/
│   │   ├── themes/
│   │   ├── students/
│   │   └── api/            ← API Routes (back-end)
│   ├── modules/            ← lógica de negócio por domínio
│   │   ├── workshops/
│   │   ├── themes/
│   │   ├── students/
│   │   ├── attendance/
│   │   └── certificates/
│   ├── lib/                ← prisma, auth, errors
│   └── components/         ← componentes React reutilizáveis
└── tests/
    ├── unit/               ← services e repositories com mocks
    └── integration/        ← API Routes com banco real
```

---

## Arquitetura

Documentada em `CLAUDE.md` — inclui decisões de stack, estrutura de pastas, regras de
camadas, estratégia de testes e convenções de código.

<!-- TODO: adicionar link para diagrama de arquitetura quando disponível -->
