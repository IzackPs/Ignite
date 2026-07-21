# Code Review & Análise Arquitetural — Ignite Finanças

> **Tech Lead / Arquiteto de Software** | Análise completa do repositório
> Stack: Next.js 16 (App Router) · TypeScript · PostgreSQL · Prisma · NextAuth v5 · Vitest · SonarQube

---

## 1. Resumo Executivo

### ✅ Pontos Fortes

| Área | Observação |
|---|---|
| **Precisão Financeira** | Uso de `decimal.js` para todo cálculo monetário — correto e profissional |
| **Algoritmo Greedy** | `simularAporteGreedy` em `calculator.ts` é uma implementação elegante e testável |
| **Separação de concerns** | Lógica pura de negócio isolada em `src/lib/calculator.ts` (sem dependências de framework) |
| **Validação de entrada** | Zod aplicado nas rotas de transações; nextAuth com schema de login separado |
| **CI/CD** | Pipeline GitHub Actions bem estruturado com lint → test → build → sonar em etapas independentes |
| **Observabilidade** | `console.error` consistente em todos os catch blocks das rotas de API |
| **Docker** | Dockerfile e docker-compose presentes, facilitando o onboarding |
| **Cobertura de testes** | Alcançou 88% de linha após ciclo de melhorias — sólido para um MVP |

### ⚠️ Principais Riscos

| Risco | Severidade |
|---|---|
| **Ausência de autenticação nas rotas de API** | 🔴 CRÍTICO |
| **Multi-tenancy quebrado no schema** | 🔴 CRÍTICO |
| **Lógica de negócio no Client Component** (`dashboard/page.tsx`) | 🟠 ALTO |
| **CDI hardcoded** como constante estática | 🟠 ALTO |
| **Nenhuma camada de serviço/repositório** | 🟡 MÉDIO |
| **`package.json` com `name: "app-tmp"`** | 🟡 MÉDIO |
| **Falta de rate limiting nas APIs** | 🟡 MÉDIO |

---

## 2. Diagnóstico Arquitetural

### 2.1 Estrutura atual

```
src/
├── actions/          # Server Actions (autenticação)
├── app/
│   ├── api/          # Route Handlers (acesso direto ao Prisma)
│   └── dashboard/    # Page components (lógica de negócio misturada)
├── components/       # UI Components (alguns com lógica de API embutida)
└── lib/
    ├── calculator.ts  # ✅ Core domain logic — bem isolado
    ├── prisma.ts      # Singleton Prisma Client
    ├── utils.ts       # Formatters
    └── validations.ts # Zod schemas (incompleto)
```

### 2.2 Problema Central: Ausência de Camada de Serviço

O projeto vai **diretamente** de Route Handler → Prisma, sem nenhuma camada intermediária. Isso cria:

- **Lógica duplicada**: `classe.toUpperCase()`, `simbolo.trim().toUpperCase()` repetidos em múltiplas rotas
- **Zero reusabilidade**: mudar a forma de buscar ativos exige editar N arquivos
- **Testabilidade reduzida**: as rotas de API são difíceis de testar sem um banco real

**Padrão recomendado (Repository Pattern):**

```
src/
├── lib/
│   ├── repositories/
│   │   ├── ativo.repository.ts     ← abstrações de acesso ao DB
│   │   ├── transacao.repository.ts
│   │   └── provento.repository.ts
│   ├── services/
│   │   ├── portfolio.service.ts    ← orquestra repositório + calculator
│   │   └── cotacao.service.ts      ← lógica de fallback Brapi→Yahoo
│   └── calculator.ts               ← mantém como está (puro, testável)
└── app/api/
    └── ativos/route.ts             ← apenas parse request + delega ao service
```

### 2.3 Violação SOLID

**Single Responsibility Principle** violado em `dashboard/page.tsx`:
- Gerencia 8+ estados de UI
- Realiza `fetch` para múltiplas APIs
- Controla modais
- Executa logout

Deveria delegar os fetches a **custom hooks** (`usePortfolio`, `useCotacoes`), mantendo o componente apenas como orquestrador de UI.

### 2.4 Schema Prisma com Multi-tenancy Incompleto

```prisma
// PROBLEMA: userId é opcional em TODOS os modelos
model Ativo {
  userId  String?   // 🚨 Nulo = qualquer usuário vê qualquer ativo
}
model HistoricoPatrimonio {
  userId  String?   // 🚨 Mesmo problema
}
```

A query em `/api/portfolio/route.ts` busca **todos os ativos do banco**, sem filtrar por `userId` da sessão:

```typescript
// ATUAL (VULNERÁVEL):
const ativos = await prisma.ativo.findMany({ include: { transacoes: true } });

// CORRETO:
const session = await auth();
const ativos = await prisma.ativo.findMany({
  where: { userId: session?.user?.id },
  include: { transacoes: true },
});
```

---

## 3. Pontos Críticos de Refatoração

### 🔴 ALTA Prioridade

---

#### CRÍTICO-1: Rotas de API sem verificação de sessão

**Arquivo:** todas as rotas em `src/app/api/*/route.ts`
**Problema:** Qualquer requisição não autenticada pode ler, criar, editar ou deletar dados.

```typescript
// ATUAL — sem autenticação:
export async function GET() {
  const ativos = await prisma.ativo.findMany(...);
  return NextResponse.json(ativos);
}

// CORRIGIDO — com guard de sessão:
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const ativos = await prisma.ativo.findMany({
    where: { userId: session.user.id },
    include: { transacoes: true },
  });
  return NextResponse.json(ativos);
}
```

---

#### CRÍTICO-2: Multi-tenancy quebrado — usuários veem dados de outros

**Arquivo:** `prisma/schema.prisma`, todas as rotas de API
**Problema:** `userId` é `String?` (nullable) em `Ativo` e `HistoricoPatrimonio`. Dados criados sem userId ficam órfãos e visíveis a todos.

```prisma
// ATUAL — userId opcional cria brecha:
model Ativo {
  userId  String?
  user    User?   @relation(...)
}

// CORRETO — userId obrigatório após migração:
model Ativo {
  userId  String
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Impacto:** Requer migração de dados + todas as rotas passarem a filtrar por `userId`.

---

#### ALTO-1: CDI hardcoded — taxa desatualizada sem aviso

**Arquivo:** `src/lib/calculator.ts`, linha 117
**Problema:** A taxa CDI de 11% a.a. está embutida no código. Com variação da Selic, os cálculos de Renda Fixa ficam silenciosamente errados.

```typescript
// ATUAL:
const TAXA_CDI_ANUAL_DEFAULT = 0.11; // 11% a.a.

// OPÇÃO 1 — Variável de ambiente (mínimo aceitável):
const TAXA_CDI_ANUAL_DEFAULT = Number(process.env.TAXA_CDI_ANUAL ?? "0.115");

// OPÇÃO 2 — Campo no banco (recomendado):
// Criar model Configuracao { chave String @id; valor String }
// Buscar ao calcular portfolio: await prisma.configuracao.findUnique({ where: { chave: 'CDI_ANUAL' } })
```

---

#### ALTO-2: `tipo` e `classe` como `String` no schema — sem enum do banco

**Arquivo:** `prisma/schema.prisma`
**Problema:** O banco aceita qualquer string nos campos `tipo` e `classe`. Um `"VENDAA"` ou `"acoes"` passará sem erro no Prisma.

```prisma
// ATUAL:
model Ativo {
  classe  String  // Sem restrição
}
model Transacao {
  tipo  String   // Sem restrição
}

// CORRETO — usar enum do Prisma:
enum TipoClasse {
  ACOES
  FIIS
  ETFS
  RENDA_FIXA
}

enum TipoTransacao {
  COMPRA
  VENDA
}

model Ativo {
  classe  TipoClasse
}
model Transacao {
  tipo  TipoTransacao
}
```

---

### 🟠 MÉDIA Prioridade

---

#### MÉDIO-1: Validação ausente em `src/app/api/ativos/route.ts`

**Problema:** Apenas `simbolo`, `nome` e `classe` são validados. Campos numéricos como `percentualIdeal` e `precoAtual` não têm schema Zod.

```typescript
// CORRIGIDO — adicionar schema Zod:
const ativoSchema = z.object({
  simbolo: z.string().min(1).max(10),
  nome: z.string().min(1).max(100),
  classe: z.enum(["ACOES", "FIIS", "ETFS", "RENDA_FIXA"]),
  setor: z.string().max(50).optional(),
  percentualIdeal: z.number().min(0).max(100).default(0),
  precoAtual: z.number().min(0).default(0),
  ultimoProvento: z.number().min(0).default(0),
  taxaRentabilidade: z.number().min(0).max(500).default(100),
});
```

---

#### MÉDIO-2: Lógica de fetch no componente de página

**Arquivo:** `src/app/dashboard/page.tsx`
**Problema:** `fetchPortfolio`, `handleAtualizarCotacoes`, `handleDeleteAtivo` coexistem com 8+ estados de modal no mesmo componente. 363 linhas em um único Page Component.

```typescript
// EXTRAIR para custom hook:
// src/hooks/usePortfolio.ts
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioComHistorico | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => { ... }, []);
  const handleDeleteAtivo = useCallback(async (id, simbolo) => { ... }, [fetchPortfolio]);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  return { portfolio, loading, fetchPortfolio, handleDeleteAtivo };
}

// src/app/dashboard/page.tsx — reduz para ~80 linhas de UI pura
export default function Home() {
  const { portfolio, loading, fetchPortfolio } = usePortfolio();
  const { updatingPrices, handleAtualizarCotacoes } = useCotacoes(fetchPortfolio);
  // ...apenas JSX
}
```

---

#### MÉDIO-3: `MetaClasse` global — sem vínculo com usuário

**Arquivo:** `prisma/schema.prisma`, modelo `MetaClasse`
**Problema:** As metas de alocação por classe são globais para todos os usuários. Usuário A sobrescreve as metas do Usuário B.

```prisma
// CORRETO:
model MetaClasse {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(...)
  classe          TipoClasse
  percentualIdeal Float
  updatedAt       DateTime @updatedAt

  @@unique([userId, classe])  // Cada usuário tem sua própria meta por classe
}
```

---

#### MÉDIO-4: Falta de rate limiting nas APIs de cotação

**Arquivo:** `src/app/api/cotacoes/route.ts`
**Problema:** O botão "Atualizar Cotações" tem cooldown apenas no **frontend** (estado React). O endpoint `POST /api/cotacoes` pode ser chamado diretamente sem limite, gerando custo com APIs externas.

```typescript
// Solução: adicionar header de rate limit ou usar middleware
// next.config.ts ou middleware.ts:
// Usar uma lib como 'next-rate-limit' ou verificar timestamp no banco
```

---

### 🟡 BAIXA Prioridade

---

#### BAIXO-1: Nomes com caracteres especiais em interfaces TypeScript

**Arquivo:** `src/lib/calculator.ts`
**Problema:** Campos como `lucroPrejuizoR$`, `faltaR$` usam `$` em nomes de propriedades TypeScript — funciona, mas é incomum e gera friction com ferramentas de lint, serialização e documentação.

```typescript
// ATUAL:
lucroPrejuizoR$: number;
faltaR$: number;

// CONVENÇÃO PADRÃO:
lucroPrejuizoReais: number;
faltaReais: number;
// OU usando camelCase puro:
lucroPrejuizo: number;
falta: number;
```

---

#### BAIXO-2: `package.json` com name de placeholder

**Arquivo:** `package.json`, linha 2
```json
// ATUAL:
{ "name": "app-tmp" }

// CORRETO:
{ "name": "ignite-financas" }
```

---

#### BAIXO-3: `calcularDiasUteis` não considera feriados

**Arquivo:** `src/lib/calculator.ts`, função `calcularDiasUteis`
**Problema:** Conta apenas finais de semana. Para Renda Fixa, o correto são 252 dias úteis por ano, excluindo feriados nacionais.

```typescript
// Melhoria: integrar com lista de feriados nacionais
// ou usar biblioteca como 'date-fns-holiday-br'
```

---

#### BAIXO-4: Lógica de negócio em `auth.config.ts`

**Arquivo:** `src/auth.config.ts`
**Problema:** O `authorize()` do NextAuth faz query direta ao Prisma. Idealmente, essa consulta estaria em um `UserRepository`.

---

## 4. Plano de Ação Recomendado

### Fase 1 — Segurança (Sprint 1 · 1-2 dias)

```
1. Adicionar guard de sessão (auth()) em TODAS as rotas de API
2. Filtrar queries por userId em portfolio, ativos, historico, metas-classes
3. Tornar userId NOT NULL no schema Prisma + migration de dados
4. Criar @@unique([userId, classe]) em MetaClasse
```

> [!CAUTION]
> A Fase 1 é bloqueante. Em produção com múltiplos usuários, os dados estão expostos.

---

### Fase 2 — Qualidade Estrutural (Sprint 2 · 3-5 dias)

```
5. Criar src/lib/validations.ts com schemas Zod para TODOS os endpoints
6. Converter String → Enum no schema Prisma (TipoClasse, TipoTransacao)
7. Extrair custom hooks do dashboard/page.tsx (usePortfolio, useCotacoes)
8. Criar camada de serviço mínima (portfolio.service.ts, cotacao.service.ts)
```

---

### Fase 3 — Resiliência e Observabilidade (Sprint 3 · 2-3 dias)

```
9.  CDI via env var (quick win) ou tabela Configuracao (correto)
10. Rate limiting real em /api/cotacoes (middleware ou Redis)
11. Substituir console.error por logger estruturado (pino ou winston)
12. Adicionar testes de integração para as rotas protegidas (auth guard)
```

---

### Fase 4 — Refinamentos (Backlog)

```
13. Renomear campos com $ para camelCase padrão
14. Considerar feriados no calcularDiasUteis
15. Renomear package.json name
16. Adicionar OpenAPI/Swagger para documentação das rotas
```

---

## Métricas Atuais vs. Meta

| Métrica | Atual | Meta Recomendada |
|---|---|---|
| Cobertura de linhas | 88% ✅ | ≥ 85% |
| Cobertura de branches | 74% ⚠️ | ≥ 80% |
| Rotas de API com auth guard | 0/8 🔴 | 8/8 |
| Endpoints com schema Zod | 1/8 ⚠️ | 8/8 |
| Enums no schema Prisma | 0/2 ⚠️ | 2/2 |
| Custom hooks extraídos | 0 ⚠️ | ≥ 3 |

---

> [!NOTE]
> **Conclusão:** O projeto tem uma base técnica sólida — o `calculator.ts` com `decimal.js` é o diferencial de qualidade mais importante. O maior débito técnico é a **ausência de isolamento de dados por usuário** nas APIs, que precisa ser endereçado antes de qualquer uso em produção com múltiplos usuários. O restante são melhorias incrementais de arquitetura que aumentam manutenibilidade e segurança ao longo do tempo.
