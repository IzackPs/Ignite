"use client";

import { useState } from 'react';
import {
  HelpCircle,
  Calculator,
  Layers,
  PieChart,
  Zap,
  Coins,
  Award,
  Compass,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export function FaqView() {
  const [activeSection, setActiveSection] = useState<"MENUS" | "MATEMATICA" | "DUVIDAS">("MENUS");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    menu_geral: true,
    math_pm: true,
    math_saude: true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Cabeçalho do FAQ */}
      <div className="bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-gold-main/20 text-gold-main border border-gold-main/30 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gold-main" />
              Central de Conhecimento
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            FAQ, Menus do Sistema & Matemática Financeira
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Entenda o funcionamento de cada módulo da plataforma Ignite Finanças e a matemática exata por trás dos nossos cálculos.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveSection("MENUS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === "MENUS"
                ? "bg-gold-main text-white shadow-md shadow-gold-main/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Menus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("MATEMATICA")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === "MATEMATICA"
                ? "bg-gold-main text-white shadow-md shadow-gold-main/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Matemática</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("DUVIDAS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === "DUVIDAS"
                ? "bg-gold-main text-white shadow-md shadow-gold-main/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Dúvidas</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: MENUS DO SISTEMA */}
      {activeSection === "MENUS" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            O que faz cada menu da aplicação:
          </div>

          {[
            {
              id: "menu_geral",
              title: "📊 Visão Geral (Consolidado)",
              icon: <PieChart className="w-5 h-5 text-gold-main" />,
              description:
                "É a central executiva da sua carteira. Reúne indicadores consolidados de patrimônio total, total investido, rentabilidade acumulada, estimativa mensal de proventos e o anel da Saúde da Carteira. Também exibe os gráficos de distribuição por classe e a tabela unificada com todos os seus ativos.",
            },
            {
              id: "menu_simulador",
              title: "⚡ Simulador de Aporte (Algoritmo Guloso)",
              icon: <Zap className="w-5 h-5 text-amber-400" />,
              description:
                "Permite simular compras com um orçamento em R$ específico. Nosso algoritmo guloso itera unidade a unidade identificando o ativo que possui a maior defasagem financeira em relação à sua meta ideal, calculando a compra e o troco remanescente exatos.",
            },
            {
              id: "menu_proventos",
              title: "💰 Proventos & Dividendos",
              icon: <Coins className="w-5 h-5 text-emerald-400" />,
              description:
                "Acompanhe o histórico de proventos (Dividendos, JCP, Rendimentos) recebidos mês a mês. Exibe o gráfico histórico mensal, média de dividendos e a discriminação por ativo pagador.",
            },
            {
              id: "menu_criterios",
              title: "⭐ Nota Ignite (Critérios de Análise)",
              icon: <Award className="w-5 h-5 text-purple-400" />,
              description:
                "Módulo de análise fundamentalista e governança. Responda a um questionário estruturado de avaliação para cada ativo (lucratividade, dívida, governança) e o sistema atribui uma Nota Ignite de 0 a 10 que influencia a prioridade dos seus aportes.",
            },
            {
              id: "menu_suitability",
              title: "🧭 Perfil de Investimento (Suitability por Idade)",
              icon: <Compass className="w-5 h-5 text-sky-400" />,
              description:
                "Gerador de recomendação por categoria de ativo. Combina os 3 perfis de risco (Conservador, Moderado e Arrojado) com a Idade do Investidor para sugerir as porcentagens de alocação das 7 classes de investimentos, podendo ser aplicada como metas com 1 clique.",
            },
            {
              id: "menu_classes",
              title: "📂 Submenu de Ativos por Classe",
              icon: <Layers className="w-5 h-5 text-blue-400" />,
              description:
                "Permite filtrar seus investimentos especificamente por categoria: Ações Nacionais, Ações Internacionais, FIIs, REITs, Criptomoedas, Renda Fixa e Renda Fixa Internacional. Cada aba conta com um banner educativo exclusivo (Número Mágico nos FIIs, YOC nas Ações BR, Dolarização, etc.).",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                </div>
                {openItems[item.id] ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {openItems[item.id] && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 border-t border-zinc-800/60 leading-relaxed animate-in fade-in">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SEÇÃO 2: A MATEMÁTICA DO SISTEMA */}
      {activeSection === "MATEMATICA" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Fórmulas Matemáticas & Algoritmos Utilizados:
          </div>

          {[
            {
              id: "math_pm",
              title: "1. Preço Médio Ponderado (Compras e Vendas)",
              formula:
                "PM_novo = [(Qtd_atual × PM_atual) + (Qtd_compra × Preço_compra)] / (Qtd_atual + Qtd_compra)",
              explanation:
                "Para compras, o novo Preço Médio é o custo médio ponderado exato. Em vendas, a posição é reduzida proporcionalmente, mantendo o Preço Médio remanescente inalterado (conforme legislação fiscal brasileira).",
            },
            {
              id: "math_saude",
              title: "2. Saúde da Carteira (Score 0 a 100%)",
              formula:
                "Score = 0.70 × [100 - (0.65 × ∑|Atual% - Meta%|)] + 0.30 × (Média_Notas_Ignite × 10)",
              explanation:
                "Pondera 70% pelo alinhamento das metas por categoria (desvio percentual acumulado) e 30% pela qualidade média fundamentalista (Notas Ignite) dos seus ativos.",
            },
            {
              id: "math_magico",
              title: "3. Número Mágico & Efeito Bola de Neve (FIIs e REITs)",
              formula: "Número Mágico = ⌈ Preço Atual / Provento Mensal ⌉",
              explanation:
                "Mede a quantidade de cotas necessárias para que os dividendos mensais paguem 1 nova cota de graça todo mês (função teto ceiling).",
            },
            {
              id: "math_cdi",
              title: "4. Renda Fixa Pro-Rata (CDI e Ano Comercial 252)",
              formula: "Taxa_Diária = (1 + Taxa_CDI_Anual)^(1 / 252) - 1",
              explanation:
                "Considera o ano comercial brasileiro de 252 dias úteis descontando feriados fixos. O rendimento acumula centavo a centavo por dia útil decorrido.",
            },
            {
              id: "math_yoc",
              title: "5. Yield On Cost (YOC - Método Barsi)",
              formula: "YOC (%) = (Proventos Anuais Estimados / Total Investido Original) × 100",
              explanation:
                "Calcula a taxa de rendimento em dividendos sobre o capital originalmente pago pelo investidor no passado.",
            },
            {
              id: "math_suitability",
              title: "6. Suitability & Ajuste por Idade",
              formula:
                "Conservador: RF = Idade + 15% | Moderado: RF = Idade% | Arrojado: RF = Idade - 15%",
              explanation:
                "O algoritmo define o piso de Renda Fixa baseado na idade e distribui os 100 - RF% remanescentes em Renda Variável com pesos específicos por perfil.",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    <Calculator className="w-5 h-5 text-gold-main" />
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                </div>
                {openItems[item.id] ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {openItems[item.id] && (
                <div className="px-4 pb-4 pt-1 space-y-2 border-t border-zinc-800/60 text-xs animate-in fade-in">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-gold-main font-bold text-xs">
                    {item.formula}
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{item.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SEÇÃO 3: DÚVIDAS E PERGUNTAS FREQUENTES */}
      {activeSection === "DUVIDAS" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Perguntas Frequentes (FAQ):
          </div>

          {[
            {
              id: "faq_1",
              question: "Como o sistema garante a precisão matemática dos cálculos?",
              answer:
                "Utilizamos a biblioteca `decimal.js` com 20 dígitos de precisão arbitrária e arredondamento padrão bancário `ROUND_HALF_UP`, eliminando erros de ponto flutuante comuns em navegadores.",
            },
            {
              id: "faq_2",
              question: "De onde vêm os logos dos ativos?",
              answer:
                "Buscamos logos automaticamente via CDNs da B3, StatusInvest e Parqet para ativos do Brasil, e via Financial Modeling Prep / SpotHQ para ações internacionais e criptomoedas. Caso a imagem falhe, o sistema exibe um badge estilizado com o Ticker do ativo.",
            },
            {
              id: "faq_3",
              question: "Como funciona a sincronização de cotações?",
              answer:
                "O botão de sincronização aciona nossas rotas de API em tempo real conectadas às cotações oficiais do mercado de ações, FIIs e moedas.",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="font-bold text-sm text-white">{item.question}</h3>
                </div>
                {openItems[item.id] ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {openItems[item.id] && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 border-t border-zinc-800/60 leading-relaxed animate-in fade-in">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
