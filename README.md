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
- [8. Status Atual e Melhorias Recentes (Refatoração & Qualidade)](#8-status-atual-e-melhorias-recentes-refatoração--qualidade)
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
│ id (cuid, PK)│         │ id (uuid, PK) │ │ id (uuid, PK)      │
│ userId (FK)  │         │ userId (FK)   │ │ userId (FK)        │
│ provider...  │         │ classe (ENUM) │ │ criterio, pergunta │
└──────────────┘         │ percentual... │ │ peso, isDefault    │
                         └───────────────┘ └─────────┬──────────┘
                                                     │
                                                     ▼
┌───────────────────────────┐             ┌─────────────────────┐
│           Ativo           │             │ AssetQuestionAnswer │
│───────────────────────────│             │─────────────────────│
│ id (uuid, PK)             │             │ id (uuid, PK)       │
│ simbolo, nome             │             │ ativoId (FK)        │
│ classe (7 ENUMs)          │────────────►│ questionId (FK)     │
│ setor, logoUrl            │             │ answer (Boolean)    │
│ percentualIdeal, preco... │             └─────────────────────┘
│ nota (Float 0..10)        │
│ userId (FK → User)        │
│───────────────────────────│
│ ← Transacao[]             │
│ ← Provento[]              │
│ ← AssetQuestionAnswer[]   │
└──────┬──────┬─────────────┘
       │      │
       ▼      ▼
┌─────────────┐ ┌─────────────┐
│  Transacao  │ │  Provento   │
│─────────────│ │─────────────│
│ id (uuid)   │ │ id (uuid)   │
│ ativoId(FK) │ │ ativoId(FK) │
│ data, tipo  │ │ data, tipo  │
│ quantidade  │ │ valorTotal  │
│ precoUnit.  │ └─────────────┘
└─────────────┘
```

### Descrição das Tabelas

| Tabela | Descrição |
|---|---|
| **User** | Usuário autenticado (NextAuth). Suporta credenciais (senha bcrypt) e OAuth (Google). |
| **Account** / **Session** / **VerificationToken** | Tabelas padrão do NextAuth para controle de sessões e logins sociais. |
| **Ativo** | Ativo financeiro da carteira. Contém símbolo, classe (7 classes), setor, logoUrl, preço atual, percentual ideal, último provento, taxa rentabilidade e **nota (0 a 10)**. |
| **Question** | Perguntas/Critérios de análise fundamentalista por usuário (ex: "ROE > 10%?", "Lucro consistente?"). |
| **AssetQuestionAnswer** | Resposta booleana (`true`/`false`) de um ativo para um determinado critério/pergunta. |
| **Transacao** | Registro de compra ou venda (`COMPRA`/`VENDA`) de um ativo com quantidade, preço unitário e data. |
| **Provento** | Registro de dividendo, JCP ou rendimento recebido de um ativo. |
| **MetaClasse** | Meta percentual ideal por classe de ativo (`ACOES_NACIONAIS`, `FIIS`, etc.) configurável por usuário. |
| **HistoricoPatrimonio** | Snapshots mensais do patrimônio total, total investido e lucro/prejuízo acumulado. |

---

## 3. Guia de Variáveis de Ambiente (.env)

| Variável | Obrigatória | Descrição | Exemplo |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | Connection string do PostgreSQL. Em container Docker Compose, o host é `db`. | `postgresql://admin:adminpassword@localhost:5432/app_db?schema=public` |
| `AUTH_SECRET` | ✅ | Segredo do NextAuth para assinar JWTs e cookies de sessão. | `chave_secreta_super_segura_1234567890` |
| `GOOGLE_CLIENT_ID` | ❌ | Client ID OAuth do Google. | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ❌ | Client Secret OAuth do Google. | `GOCSPX-xxxxxxxxxxxxxxx` |

---

## 4. Regras de Negócio Detalhadas (Fórmulas)

Toda a lógica de cálculo está centralizada no arquivo `src/lib/calculator.ts` e utiliza a biblioteca **Decimal.js** com precisão de 20 dígitos e arredondamento `ROUND_HALF_UP` para evitar erros de ponto flutuante.

### 4.1. Preço Médio Ponderado

**COMPRA:** `custoTotalAcumulado = custoTotalAcumulado + (quantidade × preçoUnitário)`  
`preçoMédio = custoTotalAcumulado ÷ quantidadeAtual`

**VENDA:** `quantidadeAtual = quantidadeAtual - quantidade` (mantém o preço médio inalterado).

### 4.2. Valor de Mercado e Lucro/Prejuízo

```
totalInvestido     = quantidadeAtual × preçoMédio
valorMercado       = quantidadeAtual × preçoAtual
lucroPrejuízo (R$) = valorMercado - totalInvestido
lucroPrejuízo (%)  = (lucroPrejuízo R$ ÷ totalInvestido) × 100
```

### 4.3. Lógica de Rebalanceamento

O rebalanceamento é calculado para **7 Classes de Ativos**:
`ACOES_NACIONAIS`, `ACOES_INTERNACIONAIS`, `FIIS`, `REITS`, `CRIPTO`, `RENDA_FIXA`, `RENDA_FIXA_INTERNACIONAL`.

```
percentualAtual  = (valorMercado do ativo ÷ patrimônioTotal) × 100
valorIdealAtivo  = (percentualIdeal ÷ 100) × patrimônioTotal
faltaR$          = valorIdealAtivo - valorMercado
```

### 4.4. Simulação de Aporte (Algoritmo Greedy)

O simulador utiliza um **algoritmo guloso (Greedy)** que distribui um orçamento em R$ comprando iterativamente 1 cota por vez do ativo com **maior defasagem em R$ em relação à meta ideal**, considerando o patrimônio acumulado iterativamente.

### 4.5. Número Mágico (FIIs)

```
númeroMágico              = ceil(preçoAtual ÷ últimoProvento)
cotasFaltantesMágico      = max(0, númeroMágico - quantidadeAtual)
progressoMágicoPercentual = (quantidadeAtual ÷ númeroMágico) × 100
```

### 4.6. Rendimento Pro-Rata Diário do CDI (Renda Fixa)

- **CDI Dinâmico**: Obtido da API do **Banco Central do Brasil** (SGS - Série 4389).
- **Ano Comercial**: 252 dias úteis.
- **Feriados Nacionais**: Dedução automática de feriados nacionais fixos brasileiros no motor `calcularDiasUteis`.

### 4.7. Nota Ignite & Checklist Fundamentalista (0 a 10)

Cada ativo possui uma nota de 0.0 a 10.0 calculada dinamicamente com base nas respostas dos critérios de análise fundamentalista:

$$\text{Nota} = \left( \frac{\sum_{\text{critérios com resposta 'Sim'}} \text{peso}_i}{\sum_{\text{todos os critérios}} \text{peso}_i} \right) \times 10$$

Caso não haja critérios cadastrados, o ativo mantém a nota neutra padrão 10.0.

---

## 5. Instruções de Inicialização (Docker)

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir containers PostgreSQL e Next.js
docker-compose up -d --build

# 3. Aplicar schema Prisma no banco
npx prisma generate
npx prisma db push

# 4. (Opcional) Executar script de validação de consistência
npm run validate:carteira
```

Aplicação disponível em: **[http://localhost:3000](http://localhost:3000)**

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
- Valida invariantess matemáticas, arredondamentos e integridade da carteira sem necessidade de subir o front-end.

### 6.4. 🌙 Dark Mode, Proventos & Real-Time Quotes
- Alternador Dark/Light Mode com `next-themes`.
- Extrato e gráfico empilhado de proventos (Dividendos, JCP, Rendimentos).
- Cotações em tempo real via Brapi.dev e Yahoo Finance com Rate Limiting de 30s.

---

## 7. OpenAPI e Documentação

O projeto possui sua API REST 100% documentada no padrão **OpenAPI 3.0** no arquivo [`openapi.yaml`](./openapi.yaml).

**Endpoints Disponíveis:**
- `GET /api/portfolio`
- `POST /api/cotacoes`
- `GET /api/cdi`
- `POST`, `DELETE /api/ativos`
- `POST`, `DELETE /api/transacoes`
- `GET`, `POST`, `DELETE /api/proventos`
- `POST`, `DELETE /api/historico`
- `POST /api/metas-classes`
- `GET`, `POST`, `DELETE /api/questions`
- `POST /api/questions/reset`
- `POST /api/user/avatar`

---

## 8. Status Atual e Melhorias Recentes (Refatoração & Qualidade)

1. **Refatoração Modular do SidebarNav**:
   - Decomposição do componente principal `SidebarNav` em subcomponentes puros (`SidebarHeaderSection`, `SidebarUserSection`, `SidebarBalanceSection`, `SidebarQuickActionsSection`, `SidebarMainMenuSection`, `SidebarClassesSection`, `SidebarFooterSection`).
   - Redução da **Complexidade Cognitiva de 18 para 5** (limite máximo permitido: 15).

2. **Qualidade e Cobertura de Testes (Vitest & Playwright)**:
   - **203 Testes Unitários e de Integração** em 55 suítes de teste.
   - Pipeline CI/CD em GitHub Actions com SonarCloud, LCOV coverage, Node 24 support e Playwright E2E.

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
| **Testes Unitários** | Vitest + Testing Library | 4.1.10 |
| **Testes E2E** | Playwright | 1.61.1 |
| **Containerização** | Docker + Docker Compose | — |

---

<p align="center">
  <sub>Documentação do <strong>Ignite</strong> — Atualizada em Julho/2026. Desenvolvido com ❤️ utilizando Next.js, Prisma e PostgreSQL.</sub>
</p>
