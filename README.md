# ⚡ Ignite 

> **Ignite** é um sistema completo de gestão de carteira de investimentos com rebalanceamento automático, simulador inteligente de aportes (Algoritmo Greedy), análise fundamentalista (Nota Ignite / Diagrama AUVP), acompanhamento de proventos e evolução patrimonial. Construído com **Next.js 16**, **Prisma ORM**, **PostgreSQL** e **Docker**.

---

## 📑 Sumário

- [1. Visão Geral do Projeto](#1-visão-geral-do-projeto)
- [2. Arquitetura e Modelagem de Dados](#2-arquitetura-e-modelagem-de-dados)
- [3. Guia de Variáveis de Ambiente (.env)](#3-guia-de-variáveis-de-ambiente-env)
- [4. Regras de Negócio Detalhadas (Fórmulas)](#4-regras-de-negócio-detalhadas-fórmulas)
  - [4.1. Preço Médio Ponderado](#41-preço-médio-ponderado)
  - [4.2. Valor de Mercado e Lucro/Prejuízo](#42-valor-de-mercado-e-lucroprejuízo)
  - [4.3. Lógica de Rebalanceamento](#43-lógica-de-rebalanceamento)
  - [4.4. Simulação de Aporte (Algoritmo Greedy)](#44-simulação-de-aporte-algoritmo-greedy)
  - [4.5. Número Mágico (FIIs)](#45-número-mágico-fiis)
  - [4.6. Rendimento Pro-Rata Diário do CDI (Renda Fixa)](#46-rendimento-pro-rata-diário-do-cdi-renda-fixa)
  - [4.7. Nota Ignite & Checklist Fundamentalista (0 a 10)](#47-nota-ignite--checklist-fundamentalista-0-a-10)
- [5. Instruções de Inicialização (Docker)](#5-instruções-de-inicialização-docker)
- [6. Funcionalidades Extras](#6-funcionalidades-extras)
  - [6.1. 🏆 Nota Ignite (Critérios & Pergunta Management)](#61--nota-ignite-critérios--pergunta-management)
  - [6.2. 🖼️ Customização de Avatar e Perfil de Investimento](#62-️-customização-de-avatar-e-perfil-de-investimento)
  - [6.3. 🧪 Script de Validação de Carteira](#63--script-de-validação-de-carteira)
  - [6.4. 🌙 Tema Dark, Proventos & Real-Time Quotes](#64--tema-dark-proventos--real-time-quotes)
- [7. OpenAPI e Documentação](#7-openapi-e-documentação)
- [8. Engenharia, Testes e Qualidade de Código](#8-engenharia-testes-e-qualidade-de-código)
- [9. Stack Tecnológica](#9-stack-tecnológica)

---

## 1. Visão Geral do Projeto

### O Problema

Investidores que seguem a estratégia de **Asset Allocation** (alocação patrimonial) precisam acompanhar constantemente a distribuição percentual dos seus ativos entre diferentes classes (Ações Nacionais, Ações Internacionais, FIIs, REITs, Criptomoedas, Renda Fixa e Renda Fixa Internacional). Quando um ativo ou classe desvia da meta ideal, é necessário **rebalancear a carteira** comprando os ativos mais defasados.

Fazer esse controle manualmente em planilhas é propenso a erros, exige recálculos constantes e não oferece automação ou notas qualitativas de ativos. O **Ignite** resolve esse problema.

### A Solução

O **Ignite** é um **painel web completo** que:

- Suporta **7 Classes de Ativos** (`ACOES_NACIONAIS`, `ACOES_INTERNACIONAIS`, `FIIS`, `REITS`, `CRIPTO`, `RENDA_FIXA`, `RENDA_FIXA_INTERNACIONAL`).
- Calcula automaticamente o **preço médio ponderado**, **lucro/prejuízo** e **valor de mercado** de cada ativo.
- Aplica a **lógica de rebalanceamento** comparando `% Atual` vs. `% Ideal` e indica exatamente quanto comprar de cada ativo.
- Oferece um **Simulador Inteligente de Aporte** (Algoritmo Greedy) que distribui um valor em R$ de forma otimizada entre os ativos mais defasados.
- Avalia ativos com a **Nota Ignite (Critérios Fundamentalistas / Diagrama AUVP)** em uma escala de 0 a 10, com perguntas ponderadas e gerenciáveis pelo usuário.
- Busca **cotações em tempo real** da B3 via APIs (Brapi.dev com fallback para Yahoo Finance).
- Consulta a **taxa CDI atualizada em tempo real** do Banco Central do Brasil (SGS).
- Calcula o **Número Mágico** para FIIs (efeito bola de neve de dividendos).
- Calcula o **rendimento pro-rata diário do CDI com dedução de feriados nacionais** para ativos de Renda Fixa.
- Registra e visualiza **proventos** (Dividendos, JCP, Rendimentos) com gráfico de escadinha mensal.
- Registra **snapshots mensais** do patrimônio para acompanhar a evolução ao longo do tempo.
- Oferece **autenticação** com login por credenciais (e-mail/senha) e login social via Google (NextAuth v5).
- Suporta **upload e customização de foto de perfil/avatar**.
- API REST documentada com **OpenAPI 3.0 (Swagger)**.

---

## 2. Arquitetura e Modelagem de Dados

O banco de dados utiliza **PostgreSQL** gerenciado pelo **Prisma ORM**. O schema está em `prisma/schema.prisma`.

### Diagrama de Relacionamentos (ER)

```
┌─────────────────────────┐
│          User           │
│─────────────────────────│
│ id (cuid, PK)           │
│ name, email, image      │
│ password (hash)         │
│ emailVerified           │
│ createdAt, updatedAt    │
│─────────────────────────│
│ ← Account[]             │
│ ← Session[]             │
│ ← Ativo[]               │
│ ← HistoricoPatrimonio[] │
│ ← MetaClasse[]          │
│ ← Question[]            │
└──────┬───┬──────┬───────┘
       │   │      │
       │   │      └──────────────────────────┐
       │   └────────────────────────┐        │
       ▼                            ▼        ▼
┌──────────────┐         ┌───────────────┐ ┌────────────────────┐
│   Account    │         │  MetaClasse   │ │      Question      │
│──────────────│         │───────────────│ │────────────────────│
│ id (cuid, PK)│         │ userId (FK)   │ │ id (uuid, PK)      │
│ userId (FK)  │         │ classe (ENUM) │ │ userId (FK)        │
│ provider...  │         │ percentual... │ │ criterio, pergunta │
└──────────────┘         └───────────────┘ │ peso, isDefault    │
                                           └─────────┬──────────┘
                                                     │
                                                     ▼
┌───────────────────────────┐             ┌─────────────────────┐
│           Ativo           │             │ AssetQuestionAnswer │
│───────────────────────────│             │─────────────────────│
│ id (uuid, PK)             │             │ id (uuid, PK)       │
│ userId (FK)               │             │ ativoId (FK)        │
│ simbolo, nome, classe...  │             │ questionId (FK)     │
│ percentualIdeal, nota     │             │ answer (BOOLEAN)    │
│ precoAtual                │             └─────────────────────┘
│───────────────────────────│
│ ← Transacao[]             │
│ ← Provento[]              │
│ ← AssetQuestionAnswer[]   │
└──────┬──────────────┬─────┘
       │              │
       ▼              ▼
┌──────────────┐ ┌──────────────┐
│  Transacao   │ │   Provento   │
│──────────────│ │──────────────│
│ id (uuid, PK)│ │ id (uuid, PK)│
│ ativoId (FK) │ │ ativoId (FK) │
│ tipo, qtd    │ │ tipo, data   │
│ precoUnitario│ │ valorTotal   │
└──────────────┘ └──────────────┘
```

---

## 3. Guia de Variáveis de Ambiente (.env)

Consulte o arquivo `.env.example` para configurar as variáveis do sistema:

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/app_db?schema=public"
AUTH_SECRET="sua_chave_secreta_super_segura"
GOOGLE_CLIENT_ID="seu_client_id_google"
GOOGLE_CLIENT_SECRET="seu_client_secret_google"
```

---

## 4. Regras de Negócio Detalhadas (Fórmulas)

### 4.1. Preço Médio Ponderado

$$\text{PM} = \frac{\sum (\text{Qtd}_{\text{compra}} \times \text{Preço}_{\text{compra}})}{\sum \text{Qtd}_{\text{compra}}}$$

### 4.2. Valor de Mercado e Lucro/Prejuízo

$$\text{Valor Mercado} = \text{Quantidade Atual} \times \text{Preço Atual}$$
$$\text{Lucro/Prejuízo} = \text{Valor Mercado} - \text{Total Investido}$$

### 4.3. Lógica de Rebalanceamento

$$\text{Falta (R\$)} = \max\left(0, \left(\text{Patrimônio Total} \times \frac{\text{Meta Ideal \%}}{100}\right) - \text{Valor Mercado Atual}\right)$$

### 4.4. Simulação de Aporte (Algoritmo Greedy)

O simulador aloca o valor disponível de forma iterativa nos ativos que apresentam o maior desvio negativo em relação à sua meta ponderada.

### 4.5. Número Mágico (FIIs)

$$\text{Número Mágico} = \left\lceil \frac{\text{Preço Atual da Cota}}{\text{Último Provento por Cota}} \right\rceil$$

### 4.6. Rendimento Pro-Rata Diário do CDI (Renda Fixa)

Dedução automática de feriados nacionais fixos brasileiros no motor `calcularDiasUteis`.

### 4.7. Nota Ignite & Checklist Fundamentalista (0 a 10)

Calculada dinamicamente no servidor para garantir integridade dos dados:

$$\text{Nota} = \left( \frac{\sum_{\text{critérios com resposta 'Sim'}} \text{peso}_i}{\sum_{\text{todos os critérios}} \text{peso}_i} \right) \times 10$$

---

## 5. Instruções de Inicialização (Docker)

### Ambiente de Desenvolvimento

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir serviços (PostgreSQL + Next.js App)
docker-compose up -d --build

# 3. Aplicar schema do banco de dados
npx prisma db push
```

Aplicação disponível em: **[http://localhost:3000](http://localhost:3000)**

### Build de Produção Standalone (~150MB)
O `Dockerfile` utiliza **Multi-Stage Build** (`deps`, `builder`, `runner`) com exportação `output: 'standalone'` e execução sob o usuário não-root `nextjs:nodejs`.

---

## 6. Funcionalidades Extras

### 6.1. 🏆 Nota Ignite (Critérios & Pergunta Management)
- Interface dedicada em **Nota Ignite (Critérios)** no menu lateral.
- Permite adicionar, editar, ponderar (pesos) e excluir critérios de análise fundamentalista.
- Botão de **Restaurar Padrões** via `/api/questions/reset`.

### 6.2. 🖼️ Customização de Avatar e Perfil de Investimento
- Modal de alteração de imagem de perfil com suporte a URLs diretas e upload Base64 via `/api/user/avatar`.
- Modal de perfil de investimento (Suitability) para definição de objetivos e horizonte de investimento.

### 6.3. 🧪 Script de Validação de Carteira
- Executável via `npm run validate:carteira` (`scripts/validate-carteira.ts`).
- Valida invariantes matemáticas, arredondamentos e integridade da carteira.

### 6.4. 🌙 Tema Dark, Proventos & Real-Time Quotes
- Interface padronizada com Tema Dark elegante (configurada nativamente via `next-themes` com `forcedTheme="dark"`).
- Extrato e gráfico empilhado de proventos (Dividendos, JCP, Rendimentos).
- Cotações em tempo real via Brapi.dev e Yahoo Finance com Rate Limiting de 30s.

---

## 7. OpenAPI e Documentação

O projeto possui sua API REST 100% documentada no padrão **OpenAPI 3.0** no arquivo [`openapi.yaml`](./openapi.yaml).

---

## 8. Engenharia, Testes e Qualidade de Código

- **Precisão Financeira**: Utilização de `Decimal(10,4)` e `Decimal(15,6)` no Prisma ORM para mitigar problemas com arredondamento binário de ponto flutuante.
- **Otimização de Renderização**: Modais pesados utilizam Dynamic Imports (`next/dynamic`) para Code-Splitting, e listas de ativos utilizam `useMemo` para mitigar re-renderizações no React.
- **Testes Unitários & Integração**: Suíte desenvolvida com **Vitest** e `vitest-mock-extended` para tipagem estrita de Mocks do banco.
- **Testes End-to-End (E2E)**: Suíte automatizada com **Playwright** cobrindo fluxos de Autenticação, Proteção de Rotas, Cadastro de Ativos e Operações Financeiras.
- **CI/CD Pipeline**: Automação via GitHub Actions para validação de Linting, Testes Unitários, Build Standalone, Testes E2E com PostgreSQL e análise SonarCloud.

---

## 9. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router + Turbopack) | 16.2.x |
| **Linguagem** | TypeScript | 5.x |
| **UI** | React | 19.2.4 |
| **Estilização** | TailwindCSS | 4.x |
| **Banco de Dados** | PostgreSQL | 15 (Alpine) |
| **ORM** | Prisma Client | 5.22.0 |
| **Autenticação** | NextAuth v5 (Auth.js) | 5.0.0-beta.32 |
| **Gráficos** | Recharts | 3.9.2 |
| **Precisão Decimal** | Decimal.js | 10.6.x |
| **Validação** | Zod | 4.4.x |
| **Testes Unitários** | Vitest + `vitest-mock-extended` | 4.1.10 |
| **Testes E2E** | Playwright | 1.61.1 |
| **Containerização** | Docker (Multi-stage Standalone) | — |

---

<p align="center">
  <sub>Documentação do <strong>Ignite</strong>. Desenvolvido com Next.js, Prisma e PostgreSQL.</sub>
</p>
