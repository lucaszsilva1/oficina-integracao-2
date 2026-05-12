# Controle de Oficinas — ELLP / UTFPR

Sistema web para gerenciamento de oficinas do projeto de extensão ELLP (Ensino Lúdico de Lógica e Programação) da UTFPR — Campus Cornélio Procópio.

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
npm test
npm run test:watch
npm run test:coverage

# Lint e formatação
npm run lint
npm run format
```

---

## Arquitetura

Documentada em `CLAUDE.md` — inclui decisões de stack, estrutura de pastas, regras de camadas, estratégia de testes e convenções de código.
