# FinDash (english - Portugues abaixo)

A full-stack financial dashboard I built as a learning and portfolio project to practice building a real application end-to-end.

The project started as a way to consolidate concepts I had been studying separately — authentication, REST APIs, relational databases, Docker, frontend state management, deployment, and external API integration — into a single system that actually works in production.

A lot of the architecture and deployment workflow was learned while building the project itself.

**Live → https://findash-nu-two.vercel.app**

---

## What it does

Users can register, log in, and access a dashboard with four main sections:

* **Clients** — full CRUD with investor risk profile classification (conservative / moderate / aggressive), investment portfolio management, and transaction history
* **Stocks** — real-time quotes and historical charts for tickers like AAPL, PETR4, BTC-USD, etc. using Yahoo Finance
* **Quotes** — live currency exchange rates
* **News** — financial headlines and market news

All external API calls are proxied through the backend, so API keys are never exposed to the client and all data endpoints stay protected behind authentication.

---

## Tech stack

### Backend

* Node.js
* Express 5
* TypeScript
* Prisma
* PostgreSQL
* JWT Authentication
* Zod
* Jest
* Supertest

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* TanStack React Query
* React Router v7
* Recharts

### Infrastructure / Deployment

* Docker & Docker Compose
* PostgreSQL
* Railway (backend)
* Vercel (frontend)

---

## Architecture overview

```text
Frontend (React/Vite)
        ↓
Axios API Layer
        ↓
Express Backend
        ↓
Controllers
        ↓
Services
        ↓
Prisma ORM
        ↓
PostgreSQL
```

The frontend communicates with the backend through a centralized API layer using Axios instances and interceptors.

The backend follows a modular controller/service structure:

* controllers handle request/response flow
* services contain business logic
* middleware handles authentication and validation

---

## Some decisions I made during development

### Why Prisma instead of MongoDB/Mongoose?

I originally planned to use MongoDB, but as the project evolved the data became strongly relational — users own clients, clients own positions and transactions.

PostgreSQL + Prisma ended up making much more sense for the type of data relationships the project needed.

---

### Why proxy external APIs through the backend?

Mainly for security and architecture practice.

API keys never reach the frontend, and it also allowed me to centralize authentication and authorization for all external data requests.

---

### Controller / Service separation

I tried to keep controllers thin and move business logic into services.

Besides making the code easier to organize, this also made testing simpler and helped me understand in practice why this separation is commonly used in backend applications.

---

### Zod validation

Request bodies are validated before reaching the database.

Combined with a global error middleware, the API returns consistent error responses and handles invalid input more safely.

---

## Running locally

You'll need:

* Node.js 20+
* Docker

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

---

### 2. Backend

```bash
cd backend
npm install

# create .env file
npx prisma migrate dev

npm run dev
```

Example `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/findash
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NEWS_API_KEY=your_newsapi_key
```

You can get a free News API key at:
https://newsapi.org

Stocks and currency exchange data currently use public endpoints and do not require API keys.

---

**Note on ports:**

* Locally the backend runs on port `3001`
* In production the Docker container exposes port `8080`, which is used by Railway


---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

During development Vite proxies `/api` requests to the backend automatically.

---

## Tests

```bash
cd backend
npm test
```

Current tests cover parts of:

* authentication flow
* API endpoints
* service logic
* request validation

using Jest and Supertest.

---

## Database schema

```text
User
 └── Client (many)
      ├── Position (many)
      └── Transaction (many)
```

---

## What I'm currently working on

* AI-assisted financial analysis features
* Separation between advisor and client accounts/permissions
* Swagger API documentation
* Frontend tests

---

## Note:
Im new on this, im learning so some lines and ways can be wrong.

## Author

Nicolas Martins Goulart

---


##Portugues

# FinDash

Um dashboard financeiro full-stack que construí como projeto de aprendizado e portfólio para praticar o desenvolvimento de uma aplicação real ponta a ponta.

O projeto começou como uma forma de consolidar conceitos que eu vinha estudando separadamente — autenticação, APIs REST, banco de dados relacional, Docker, gerenciamento de estado no frontend, deploy e integração com APIs externas — em um único sistema realmente funcionando em produção.

Grande parte da arquitetura e do fluxo de deploy foi aprendida durante o próprio desenvolvimento do projeto.

**Live → https://findash-nu-two.vercel.app**

---

## O que faz

O usuário pode se cadastrar, fazer login e acessar um dashboard com quatro seções principais:

* **Clientes** — CRUD completo com classificação de perfil de risco (conservador / moderado / agressivo), gerenciamento de portfólio de investimentos e histórico de transações
* **Ações** — cotações em tempo real e gráficos históricos para tickers como AAPL, PETR4, BTC-USD etc. usando Yahoo Finance
* **Câmbio** — taxas de câmbio em tempo real
* **Notícias** — manchetes e notícias do mercado financeiro

Todas as chamadas para APIs externas passam pelo backend, então as chaves de API nunca ficam expostas no cliente e todos os endpoints de dados permanecem protegidos por autenticação.

---

## Stack

### Backend

* Node.js
* Express 5
* TypeScript
* Prisma
* PostgreSQL
* Autenticação JWT
* Zod
* Jest
* Supertest

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* TanStack React Query
* React Router v7
* Recharts

### Infraestrutura / Deploy

* Docker & Docker Compose
* PostgreSQL
* Railway (backend)
* Vercel (frontend)

---

## Visão geral da arquitetura

```text
Frontend (React/Vite)
        ↓
Camada de API com Axios
        ↓
Backend Express
        ↓
Controllers
        ↓
Services
        ↓
Prisma ORM
        ↓
PostgreSQL
```

O frontend se comunica com o backend através de uma camada centralizada de API usando instâncias Axios e interceptors.

O backend segue uma estrutura modular baseada em controller/service:

* controllers lidam com fluxo de request/response
* services contêm a lógica de negócio
* middlewares lidam com autenticação e validação

---

## Algumas decisões que tomei durante o desenvolvimento

### Por que Prisma em vez de MongoDB/Mongoose?

Originalmente eu planejava usar MongoDB, mas conforme o projeto evoluiu os dados passaram a ter uma estrutura fortemente relacional — usuários possuem clientes, clientes possuem posições e transações.

PostgreSQL + Prisma acabou fazendo muito mais sentido para o tipo de relacionamento que o projeto precisava.

---

### Por que fazer proxy das APIs externas pelo backend?

Principalmente por segurança e prática de arquitetura.

As chaves de API nunca chegam ao frontend, e isso também me permitiu centralizar autenticação e autorização para todas as requisições externas.

---

### Separação entre Controller / Service

Tentei manter os controllers mais simples e mover a lógica de negócio para os services.

Além de deixar o código mais organizado, isso também facilitou os testes e me ajudou a entender na prática por que essa separação é tão comum em aplicações backend.

---

### Validação com Zod

Os bodies das requisições são validados antes de chegar ao banco de dados.

Combinado com um middleware global de erro, a API retorna respostas consistentes e lida de forma mais segura com entradas inválidas.

---

## Rodando localmente

Você vai precisar de:

* Node.js 20+
* Docker

### 1. Subir o PostgreSQL

```bash
docker-compose up -d
```

---

### 2. Backend

```bash
cd backend
npm install

# criar arquivo .env
npx prisma migrate dev

npm run dev
```

Exemplo de `.env`:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/findash
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
NEWS_API_KEY=your_newsapi_key
```

Você pode obter uma chave gratuita da News API em:
https://newsapi.org

Os dados de ações e câmbio atualmente utilizam endpoints públicos e não exigem chave de API.

---

**Sobre as portas:**

* Localmente o backend roda na porta `3001`
* Em produção o container Docker expõe a porta `8080`, utilizada pela Railway

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend roda em:

```text
http://localhost:5173
```

Durante o desenvolvimento o Vite faz proxy automático das requisições `/api` para o backend.

---

## Testes

```bash
cd backend
npm test
```

Os testes atuais cobrem partes de:

* fluxo de autenticação
* endpoints da API
* lógica de services
* validação de requisições

usando Jest e Supertest.

---

## Schema do banco de dados

```text
User
 └── Client (many)
      ├── Position (many)
      └── Transaction (many)
```

---

## O que estou desenvolvendo atualmente

* Funcionalidades de análise financeira assistidas por IA
* Separação entre contas/permissões de advisor e client
* Documentação da API com Swagger
* Testes no frontend

---

##Nota:
Ainda estou aprendendo, entao alguns pontos e pensamentos podem estar errados.

## Autor

Nicolas Martins Goulart

