# ⚡ Ignite — Asset Allocation & Rebalanceamento

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
  - [6.4. 🌙 Dark Mode, Proventos & Real-Time Quotes](#64--dark-mode-proventos--real-time-quotes)
- [7. OpenAPI e Documentação](#7-openapi-e-documentação)
- [8. Relatório da Auditoria Sênior (5 Níveis de Qualidade & Refatoração)](#8-relatório-da-auditoria-sênior-5-níveis-de-qualidade--refatoração)
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

Calculada dinamicamente e **recalculada no backend como única fonte da verdade**:

$$\text{Nota} = \left( \frac{\sum_{\text{critérios com resposta 'Sim'}} \text{peso}_i}{\sum_{\text{todos os critérios}} \text{peso}_i} \right) \times 10$$

---

## 5. Instruções de Inicialização (Docker & Produção)

### Rodando em Desenvolvimento via Docker Compose

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir containers (PostgreSQL com Healthcheck + Next.js App)
docker-compose up -d --build

# 3. Aplicar schema Prisma no banco
npx prisma generate
npx prisma db push
```

Aplicação disponível em: **[http://localhost:3000](http://localhost:3000)**

### Produção Docker Standalone (Imagem Enxuta de ~150MB)
O `Dockerfile` utiliza **Multi-Stage Build** (com estágios `base`, `deps`, `builder` e `runner`) rodando sob o usuário de sistema não-root `nextjs:nodejs` e exportando artefatos `output: 'standalone'`.

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

### 6.4. 🌙 Dark Mode, Proventos & Real-Time Quotes
- Alternador Dark/Light Mode com `next-themes`.
- Extrato e gráfico empilhado de proventos (Dividendos, JCP, Rendimentos).
- Cotações em tempo real via Brapi.dev e Yahoo Finance com Rate Limiting de 30s.

---

## 7. OpenAPI e Documentação

O projeto possui sua API REST 100% documentada no padrão **OpenAPI 3.0** no arquivo [`openapi.yaml`](./openapi.yaml).

---

## 8. Relatório da Auditoria Sênior (5 Níveis de Qualidade & Refatoração)

O projeto passou por uma auditoria crítica dividida em 5 pilares estruturais de engenharia de software:

1. **Nível 1 — Fundações e Configurações**:
   - Atualização de compatibilidade CI/CD para **Node.js 24**.
   - Refatoração de configs base (`tsconfig.json`, `next.config.ts`).
   - Remoção de imports redundantes `import React from "react"` e ordenamento estrito de `"use client"`.

2. **Nível 2 — Modelagem de Dados e Segurança**:
   - Migração dos tipos de moeda no Prisma de `Float` para `Decimal(10,4)` e `Decimal(15,6)`.
   - Adição de índices `@@index` nas tabelas `Transacao`, `Provento` e `HistoricoPatrimonio`.
   - Adaptação do `middleware.ts` para o novo padrão `proxy.ts` (Next.js 16+).

3. **Nível 3 — Backend e Regras de Negócio**:
   - **Nota Ignite Unica Fonte da Verdade**: O backend descarta qualquer nota vinda do front-end e a calcula matematicamente com os pesos do banco.
   - **Coerção Zod**: Aplicação global de `z.coerce.number()` no `validations.ts`.
   - Otimização do loop de proventos no Node Heap evitando alocações desnecessárias de objetos.

4. **Nível 4 — Frontend e React Patterns**:
   - **Dynamic Imports (`next/dynamic`)**: Carregamento sob demanda (Lazy Loading) dos modais pesados (`AssetModal`, `SimuladorModal`, `TransactionModal`, etc.), reduzindo o *bundle size* inicial.
   - **Memoization com `useMemo`**: Filtros de ativos isolados em memória para impedir re-renders em cascata da `AssetTable`.

5. **Nível 5 — Testes, Qualidade e CI/CD**:
   - **Vitest + `vitest-mock-extended`**: Injeção de `mockDeep<PrismaClient>()` para testes unitários com tipagem forte e validações comportamentais estritas (`toHaveBeenCalledWith`).
   - **Playwright E2E**: Suíte completa de testes End-to-End cobrindo Registro, Login, Proteção de Rotas, CRUD de Ativos e Movimentações Financeiras.
   - **GitHub Actions**: Pipeline CI/CD integrado com SonarCloud, cobertura LCOV e serviço de PostgreSQL containerizado para testes E2E.

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
| **Autenticação** | NextAuth v5 (Auth.js) | 5.0.0-beta.31 |
| **Gráficos** | Recharts | 3.9.2 |
| **Precisão Decimal** | Decimal.js | 10.6.x |
| **Validação** | Zod | 4.4.x |
| **Testes Unitários** | Vitest + `vitest-mock-extended` | 4.1.10 |
| **Testes E2E** | Playwright | 1.61.1 |
| **Containerização** | Docker (Multi-stage Standalone) | — |

---

<p align="center">
  <sub>Documentação do <strong>Ignite</strong> — Atualizada em Julho/2026. Desenvolvido com ❤️ utilizando Next.js, Prisma e PostgreSQL.</sub>
</p>
