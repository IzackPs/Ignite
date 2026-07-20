# ⚡ Ignite — Asset Allocation & Rebalanceamento

> **Ignite** é um sistema completo de gestão de carteira de investimentos com rebalanceamento automático, simulador inteligente de aportes, acompanhamento de proventos e evolução patrimonial. Construído com **Next.js 16**, **Prisma ORM**, **PostgreSQL** e **Docker**.

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
- [5. Instruções de Inicialização (Docker)](#5-instruções-de-inicialização-docker)
- [6. Funcionalidades Extras](#6-funcionalidades-extras)
- [7. Stack Tecnológica](#7-stack-tecnológica)

---

## 1. Visão Geral do Projeto

### O Problema

Investidores que seguem a estratégia de **Asset Allocation** (alocação patrimonial) precisam acompanhar constantemente a distribuição percentual dos seus ativos entre diferentes classes (Ações, FIIs, ETFs e Renda Fixa). Quando um ativo ou classe desvia da meta ideal, é necessário **rebalancear a carteira** comprando os ativos mais defasados.

Fazer esse controle manualmente em planilhas é propenso a erros, exige recálculos constantes e não oferece automação. O **Ignite** resolve esse problema.

### A Solução

O **Ignite** é um **painel web completo** que:

- Calcula automaticamente o **preço médio ponderado**, **lucro/prejuízo** e **valor de mercado** de cada ativo.
- Aplica a **lógica de rebalanceamento** comparando `% Atual` vs. `% Ideal` e indica exatamente quanto comprar de cada ativo.
- Oferece um **Simulador Inteligente de Aporte** (Algoritmo Greedy) que distribui um valor em R$ de forma otimizada entre os ativos mais defasados.
- Busca **cotações em tempo real** da B3 via APIs (Brapi.dev com fallback para Yahoo Finance).
- Calcula o **Número Mágico** para FIIs (efeito bola de neve de dividendos).
- Calcula o **rendimento pro-rata diário do CDI** para ativos de Renda Fixa.
- Registra e visualiza **proventos** (Dividendos, JCP, Rendimentos) com gráfico de escadinha mensal.
- Registra **snapshots mensais** do patrimônio para acompanhar a evolução ao longo do tempo.
- Oferece **autenticação** com login por credenciais (e-mail/senha) e login social via Google (NextAuth v5).

---

## 2. Arquitetura e Modelagem de Dados

O banco de dados utiliza **PostgreSQL** gerenciado pelo **Prisma ORM**. O schema está em `prisma/schema.prisma`.

### Diagrama de Relacionamentos (ER)

```
┌─────────────────────┐
│        User         │
│─────────────────────│
│ id (cuid, PK)       │
│ name, email, image  │
│ password (hash)     │
│ emailVerified       │
│ createdAt, updatedAt│
│─────────────────────│
│ ← Account[]         │
│ ← Session[]         │
│ ← Ativo[]           │
│ ← HistóricoPatrim[] │
└──────┬───┬──────────┘
       │   │
       │   └──────────────────────────┐
       ▼                              ▼
┌──────────────┐           ┌────────────────────────┐
│   Account    │           │   HistoricoPatrimonio  │
│──────────────│           │────────────────────────│
│ id (cuid,PK) │           │ id (uuid, PK)          │
│ userId (FK)  │           │ data                   │
│ type         │           │ patrimonioTotal        │
│ provider     │           │ totalInvestido         │
│ providerAccId│           │ lucroPrejuizo          │
│ tokens...    │           │ userId? (FK)           │
└──────────────┘           └────────────────────────┘

┌─────────────────────────┐
│         Ativo           │
│─────────────────────────│
│ id (uuid, PK)           │
│ simbolo (unique)        │
│ nome                    │
│ classe (ENUM-like)      │───── "ACOES" | "FIIS" | "ETFS" | "RENDA_FIXA"
│ setor?                  │
│ percentualIdeal (Float) │
│ precoAtual (Float)      │
│ ultimoProvento (Float)  │
│ taxaRentabilidade (Float)│
│ userId? (FK → User)     │
│ createdAt, updatedAt    │
│─────────────────────────│
│ ← Transacao[]           │
│ ← Provento[]            │
└──────┬──────┬───────────┘
       │      │
       ▼      ▼
┌─────────────┐ ┌─────────────┐
│  Transacao  │ │  Provento   │
│─────────────│ │─────────────│
│ id (uuid)   │ │ id (uuid)   │
│ ativoId(FK) │ │ ativoId(FK) │
│ data        │ │ data        │
│ tipo        │ │ tipo        │──── "DIVIDENDO" | "JCP" | "RENDIMENTO"
│ quantidade  │ │ valorTotal  │
│ precoUnit.  │ │ createdAt   │
│ createdAt   │ └─────────────┘
└─────────────┘

┌──────────────────┐     ┌───────────────────┐
│ VerificationToken│     │    MetaClasse      │
│──────────────────│     │───────────────────│
│ identifier       │     │ classe (PK)       │──── "ACOES" | "FIIS" | etc.
│ token (unique)   │     │ percentualIdeal   │
│ expires          │     │ updatedAt         │
└──────────────────┘     └───────────────────┘
```

### Descrição das Tabelas

| Tabela | Descrição |
|---|---|
| **User** | Usuário autenticado (NextAuth). Suporta login com credenciais (senha hasheada com bcrypt) e OAuth (Google). |
| **Account** | Conta OAuth vinculada ao usuário (ex: Google). Padrão NextAuth. |
| **Session** | Sessão ativa do usuário. Padrão NextAuth. |
| **VerificationToken** | Token de verificação de e-mail. Padrão NextAuth. |
| **Ativo** | Ativo financeiro da carteira. Contém símbolo (ticker), classe, preço atual, percentual ideal na carteira, último provento e taxa de rentabilidade (para Renda Fixa). |
| **Transacao** | Registro de compra ou venda de um ativo. Contém data, tipo (`COMPRA`/`VENDA`), quantidade e preço unitário. |
| **Provento** | Registro de dividendo, JCP ou rendimento recebido de um ativo. |
| **MetaClasse** | Meta percentual ideal por classe de ativo (ex: Ações 40%, FIIs 10%). Configurável pelo usuário. |
| **HistoricoPatrimonio** | Snapshot mensal do patrimônio total, total investido e lucro/prejuízo acumulado. |

---

## 3. Guia de Variáveis de Ambiente (.env)

### Tabela de Variáveis

| Variável | Obrigatória | Descrição | Exemplo |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | Connection string do PostgreSQL. Quando rodando via Docker Compose, o host deve ser `db` (nome do serviço). Para acesso local direto, use `localhost`. | `postgresql://admin:adminpassword@localhost:5432/app_db?schema=public` |
| `AUTH_SECRET` | ✅ | Segredo usado pelo NextAuth para assinar tokens JWT e cookies de sessão. Deve ser uma string aleatória longa e segura. | `minha_chave_secreta_super_segura_1234567890` |
| `GOOGLE_CLIENT_ID` | ❌ | Client ID do OAuth do Google (obtido no Google Cloud Console). Necessário apenas se quiser habilitar login com Google. | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ❌ | Client Secret do OAuth do Google. Par do `GOOGLE_CLIENT_ID`. | `GOCSPX-xxxxxxxxxxxxxxx` |

### Exemplo de arquivo `.env.example`

Um arquivo `.env.example` foi gerado na raiz do projeto com as chaves vazias para referência segura.

> ⚠️ **Importante:** Nunca commite o arquivo `.env` com suas credenciais reais. Adicione-o ao `.gitignore`.

---

## 4. Regras de Negócio Detalhadas (Fórmulas)

Toda a lógica de cálculo está centralizada no arquivo `src/lib/calculator.ts` e utiliza a biblioteca **Decimal.js** com precisão de 20 dígitos e arredondamento `ROUND_HALF_UP` para evitar erros de ponto flutuante.

### 4.1. Preço Médio Ponderado

O preço médio é recalculado a cada transação registrada, processando todas as transações ordenadas por data.

**Para transações de COMPRA:**

```
custoTotalAcumulado = custoTotalAcumulado + (quantidade × preçoUnitário)
quantidadeAtual     = quantidadeAtual + quantidade
preçoMédio          = custoTotalAcumulado ÷ quantidadeAtual
```

**Para transações de VENDA:**

```
quantidadeAtual    = quantidadeAtual - quantidade
custoTotalAcumulado = quantidadeAtual × preçoMédio   (mantém o preço médio inalterado)
```

> Se a venda zerar a posição (`quantidadeAtual ≤ 0`), todos os acumuladores são resetados para zero.

**Exemplo prático:**

| # | Tipo | Qtd | Preço | Custo Acum. | Qtd Atual | Preço Médio |
|---|---|---:|---:|---:|---:|---:|
| 1 | COMPRA | 10 | R$ 25,00 | R$ 250,00 | 10 | R$ 25,00 |
| 2 | COMPRA | 5 | R$ 30,00 | R$ 400,00 | 15 | R$ 26,67 |
| 3 | VENDA | 3 | R$ 35,00 | R$ 320,01 | 12 | R$ 26,67 |

---

### 4.2. Valor de Mercado e Lucro/Prejuízo

```
totalInvestido       = quantidadeAtual × preçoMédio
valorMercado         = quantidadeAtual × preçoAtual
lucroPrejuízo (R$)   = valorMercado - totalInvestido
lucroPrejuízo (%)    = (lucroPrejuízo R$ ÷ totalInvestido) × 100
```

**Patrimônio Total (global):**

```
patrimônioTotal          = Σ valorMercado de todos os ativos
totalInvestidoTotal      = Σ totalInvestido de todos os ativos
lucroPrejuízoTotal (R$)  = patrimônioTotal - totalInvestidoTotal
lucroPrejuízoTotal (%)   = (lucroPrejuízoTotal R$ ÷ totalInvestidoTotal) × 100
```

---

### 4.3. Lógica de Rebalanceamento

O rebalanceamento é calculado **por ativo individual** e também **por classe de ativo**:

#### Por Ativo

```
percentualAtual  = (valorMercado do ativo ÷ patrimônioTotal) × 100
valorIdealAtivo  = (percentualIdeal ÷ 100) × patrimônioTotal
faltaR$          = valorIdealAtivo - valorMercado
```

| Condição | Status | Ação |
|---|---|---|
| `faltaR$ > 0` E `precoAtual > 0` | **COMPRAR** | `qtdAComprar = floor(faltaR$ ÷ precoAtual)` |
| `faltaR$ ≤ 0` | **AGUARDAR** | O ativo está dentro ou acima da meta. |

#### Por Classe de Ativo

```
valorMercadoClasse  = Σ valorMercado de todos os ativos da classe
percentualAtual     = (valorMercadoClasse ÷ patrimônioTotal) × 100
valorIdealClasse    = (metaPercentual ÷ 100) × patrimônioTotal
faltaR$Classe       = valorIdealClasse - valorMercadoClasse
```

**Metas padrão por classe:**

| Classe | Meta Padrão |
|---|---:|
| Ações | 40% |
| FIIs | 10% |
| ETFs | 10% |
| Renda Fixa | 40% |

> As metas são customizáveis pelo usuário através do modal "Editar Metas por Classe" e são persistidas na tabela `MetaClasse`.

---

### 4.4. Simulação de Aporte (Algoritmo Greedy)

O simulador de aporte utiliza um **algoritmo guloso (Greedy)** que distribui um orçamento em R$ comprando iterativamente 1 cota por vez do ativo com **maior defasagem em R$ em relação à meta ideal**.

#### Pseudocódigo

```
ENTRADA: ativos[], patrimônioAtual, orçamento
SAÍDA:   itensCarrinho[], totalGasto, sobraTroco

candidatos ← ativos com precoAtual > 0 E percentualIdeal > 0
orcamentoRestante ← orçamento
patrimonioSimulado ← patrimônioAtual

ENQUANTO orcamentoRestante > 0:
    melhorCandidato ← NULL
    maiorDefasagem  ← -∞

    PARA CADA candidato em candidatos:
        SE candidato.precoAtual ≤ orcamentoRestante:
            valorIdealSimulado ← candidato.percentualIdeal × patrimonioSimulado
            defasagem ← valorIdealSimulado - candidato.valorMercadoSimulado

            SE defasagem > maiorDefasagem:
                maiorDefasagem ← defasagem
                melhorCandidato ← candidato

    SE melhorCandidato = NULL:
        BREAK  // nenhum ativo cabe no orçamento restante

    melhorCandidato.qtdSimulada += 1
    melhorCandidato.valorMercadoSimulado += melhorCandidato.precoAtual
    orcamentoRestante -= melhorCandidato.precoAtual
    patrimonioSimulado += melhorCandidato.precoAtual

totalGasto ← orçamento - orcamentoRestante
sobraTroco ← orcamentoRestante
```

**Características do algoritmo:**

- A cada iteração, recalcula a defasagem considerando o patrimônio simulado atualizado (já incluindo as compras anteriores).
- Compra apenas **unidades inteiras** (floor).
- Retorna o **troco** (sobra) quando nenhum ativo cabe no orçamento restante.
- O usuário pode clicar em **"Executar Ordem de Aporte"** para registrar todas as compras simuladas como transações reais no banco.

---

### 4.5. Número Mágico (FIIs)

O **Número Mágico** é um conceito do efeito bola de neve para Fundos Imobiliários. Representa a quantidade de cotas necessária para que os proventos recebidos paguem 1 nova cota por mês automaticamente.

```
númeroMágico              = ceil(preçoAtual ÷ últimoProvento)
cotasFaltantesMágico      = max(0, númeroMágico - quantidadeAtual)
progressoMágicoPercentual = (quantidadeAtual ÷ númeroMágico) × 100
rendaMensalEstimada       = quantidadeAtual × últimoProvento
```

**Exemplo:**

| Dado | Valor |
|---|---|
| Preço Atual (MXRF11) | R$ 10,50 |
| Último Provento | R$ 0,10/cota |
| **Número Mágico** | `ceil(10,50 / 0,10)` = **105 cotas** |
| Cotas atuais | 60 |
| Cotas faltantes | 45 |
| Progresso | 57,14% |
| Renda Mensal Estimada | 60 × R$ 0,10 = **R$ 6,00/mês** |

---

### 4.6. Rendimento Pro-Rata Diário do CDI (Renda Fixa)

Para ativos da classe `RENDA_FIXA`, o sistema calcula o rendimento acumulado com base na taxa CDI e na rentabilidade percentual do título.

#### Constantes

```
TAXA_CDI_ANUAL     = 11,00% (0.11)
TAXA_CDI_DIÁRIA    = (1 + 0.11)^(1/252) - 1  ≈  0,0004134%
```

> O ano comercial utilizado é de **252 dias úteis**.

#### Cálculo

```
diasÚteis             = contagem de dias úteis (seg-sex) entre a primeira compra e hoje
taxaDiáriaEfetiva     = TAXA_CDI_DIÁRIA × (taxaRentabilidade ÷ 100)
fatorAcumulado        = (1 + taxaDiáriaEfetiva)^diasÚteis
preçoAtualCalculado   = preçoMédio × fatorAcumulado
rendimentoProRata R$  = (preçoAtualCalculado - preçoMédio) × quantidadeAtual
```

**Exemplo (CDB 120% do CDI):**

| Dado | Valor |
|---|---|
| Preço Médio | R$ 1.000,00 |
| Taxa Rentabilidade | 120% do CDI |
| Dias Úteis | 126 (≈ 6 meses) |
| Taxa Diária Efetiva | `0,0004134 × 1,20` = 0,0004961 |
| Fator Acumulado | `(1,0004961)^126` ≈ 1,0644 |
| Preço Calculado | R$ 1.064,40 |
| **Rendimento** | **(1.064,40 - 1.000) × 1** = **R$ 64,40** |

---

## 5. Instruções de Inicialização (Docker)

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Node.js 20+](https://nodejs.org/) (para comandos Prisma locais)
- Git (opcional, para clonar o repositório)

### Passo a Passo

#### 1. Clone ou abra o projeto

```bash
git clone <url-do-repositorio> gerenciador-carteira
cd gerenciador-carteira
```

#### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env` com seus valores:

```env
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/app_db?schema=public"
AUTH_SECRET=gere_uma_string_segura_aqui
GOOGLE_CLIENT_ID=seu_client_id_aqui       # opcional
GOOGLE_CLIENT_SECRET=seu_secret_aqui      # opcional
```

#### 3. Instale as dependências locais (necessário para os comandos do Prisma)

```bash
npm install
```

#### 4. Suba os containers Docker

```bash
docker-compose up -d --build
```

Isso irá:
- Baixar e iniciar o **PostgreSQL 15** no container `postgres_db` (porta `5432`)
- Buildar e iniciar o **Next.js** no container `nextjs_app` (porta `3000`)

#### 5. Aplique o schema no banco de dados

```bash
npx prisma generate
npx prisma db push
```

> Alternativamente, para manter histórico de migrações:
> ```bash
> npx prisma migrate dev --name init
> ```

#### 6. (Opcional) Popule o banco com dados de exemplo

```bash
npx ts-node prisma/seed.ts
```

#### 7. Acesse a aplicação

Abra o navegador em **[http://localhost:3000](http://localhost:3000)**

### Comandos Úteis

| Comando | Descrição |
|---|---|
| `docker-compose up -d --build` | Inicia os containers (build se necessário) |
| `docker-compose down` | Para e remove os containers |
| `docker-compose down -v` | Para, remove containers **e apaga o volume do banco** |
| `docker-compose logs -f app` | Acompanha logs do Next.js em tempo real |
| `docker-compose logs -f db` | Acompanha logs do PostgreSQL |
| `npx prisma studio` | Abre o Prisma Studio (interface visual do banco) na porta `5555` |
| `npx prisma db push` | Sincroniza o schema com o banco sem migration |
| `npx prisma migrate dev` | Cria e aplica uma nova migration |

---

## 6. Funcionalidades Extras

### 🌙 Dark Mode / Light Mode

O sistema possui um alternador de tema (Dark/Light Mode) implementado com a biblioteca `next-themes`. O tema é persistido no `localStorage` do navegador e o ícone de alternância fica no cabeçalho do dashboard (sol/lua).

### 📸 Snapshot Mensal de Patrimônio

No dashboard principal, o botão **"Salvar Foto Mensal"** registra um snapshot do patrimônio total, total investido e lucro/prejuízo na data atual. Esses registros são armazenados na tabela `HistoricoPatrimonio` e exibidos em:

- **Gráfico de Área** — Evolução do patrimônio vs total investido ao longo do tempo.
- **Tabela de Registros** — Lista de todos os snapshots com opção de exclusão.

### 💰 Escadinha de Proventos

A aba **"Proventos"** permite registrar dividendos, JCP e rendimentos recebidos. O sistema exibe:

- **3 Cards de indicadores**: Total histórico recebido, média mensal e renda do mês atual.
- **Gráfico de Barras Empilhadas**: Evolução mensal dos proventos por categoria (Dividendo, JCP, Rendimento).
- **Tabela de Extrato**: Lista completa de lançamentos com data, ticker, tipo e valor.

### 📡 Cotações em Tempo Real

O botão **"Atualizar Cotações"** busca preços atualizados para ativos de renda variável (Ações, FIIs, ETFs) através de:

1. **API Brapi.dev** (primária) — Gratuita para cotações da B3.
2. **Yahoo Finance** (fallback) — Usado automaticamente caso a Brapi esteja indisponível.

As cotações são atualizadas automaticamente a cada **1 hora** em background, além do botão manual.

### 🔐 Autenticação

O sistema utiliza **NextAuth v5 (Auth.js)** com:

- **Login por credenciais** (e-mail + senha hasheada com bcrypt).
- **Login social via Google** (OAuth 2.0) — requer configuração das variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
- Sessão baseada em **JWT** (sem necessidade de tabela de sessão no banco).
- Proteção de rotas via middleware: o dashboard (`/dashboard`) é acessível apenas para usuários autenticados.

---

## 7. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router + Turbopack) | 16.2.10 |
| **Linguagem** | TypeScript | 5.x |
| **UI** | React | 19.x |
| **Estilização** | TailwindCSS | 4.x |
| **Banco de Dados** | PostgreSQL | 15 (Alpine) |
| **ORM** | Prisma Client | 5.22.0 |
| **Autenticação** | NextAuth v5 (Auth.js) | 5.0.0-beta.31 |
| **Gráficos** | Recharts | 3.9.x |
| **Precisão Decimal** | Decimal.js | 10.6.x |
| **Validação** | Zod | 4.4.x |
| **Formulários** | React Hook Form + Resolvers | 7.x |
| **Ícones** | Lucide React | 1.25.x |
| **Containerização** | Docker + Docker Compose | — |
| **Hash de Senhas** | bcryptjs | 3.x |

---

<p align="center">
  <sub>Documentação do <strong>Ignite</strong> — gerada em Julho/2026. Desenvolvido com ❤️ utilizando Next.js, Prisma e PostgreSQL.</sub>
</p>
