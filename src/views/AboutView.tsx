import React from 'react';
import { BookOpen, Info, FileText, HelpCircle, Layers, Settings } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section className="space-y-8 max-w-4xl mx-auto px-4">
  <h2 className="text-4xl font-display font-extrabold text-text-main tracking-tight text-center">
    Sobre o Projeto
  </h2>

  <div className="text-lg text-text-muted leading-relaxed text-justify space-y-6">
    <p>
      Esta ferramenta foi desenvolvida para traduzir em dados acionáveis o impacto técnico e operacional dos estudos conduzidos pelo <strong>GADHOC Aeroportos (Grupo Ad Hoc de Eficiência Operacional em Aeroportos)</strong>. 
      Instituído formalmente em 17 de fevereiro de 2022, o grupo une a indústria da aviação, órgãos reguladores e concessionárias com a missão de viabilizar o crescimento sustentável do setor por meio da otimização da infraestrutura existente.
    </p>

    <p>
      O sistema baseia-se nos dados consolidados a partir dos informes e coletas de dados realizadas em todos os aeródromos participantes do grupo. 
      A ferramenta oferece uma demonstração quantitativa e analítica dos ganhos obtidos em cada fase do projeto, focando em quatro pilares fundamentais de economia:
    </p>

    <ul className="list-none space-y-3">
      <li>
        <strong>Distância:</strong> Redução de trajetórias nominais em voo (via otimização de SIDs OMNI) e de rolagem no solo (através de decolagens por interseção).
      </li>
      <li>
        <strong>Tempo:</strong> Mitigação de atrasos adicionais e redução dos tempos de taxi-out e ocupação de pista (ROT), agilizando o fluxo solo-ar.
      </li>
      <li>
        <strong>Combustível:</strong> Economia direta gerada pela antecipação de curvas após a decolagem (rebaixamento de Turning Points para 500ft) e maior celeridade nas manobras.
      </li>
      <li>
        <strong>Emissões de CO²:</strong> Monitoramento do impacto ambiental positivo, traduzindo a eficiência operacional em sustentabilidade ecológica e conformidade com metas internacionais.
      </li>
    </ul>

    <p>
      Dessa forma, este projeto serve como um <strong>painel de governança</strong> que valida o progresso das Fases 1A a 1C — abrangendo desde a eficiência de pista (HIRO) até a implementação de separações mínimas reduzidas (RRSM) — transformando diagnósticos técnicos em indicadores claros de performance e competitividade para o mercado de aviação nacional.
    </p>
  </div>
</section>

      <div className="flex justify-center">
        <div className="bg-surface-card p-10 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
          <h3 className="text-2xl font-display font-bold text-text-main mb-8 flex items-center gap-3">
            <BookOpen className="text-gain w-8 h-8" /> Metodologia
          </h3>
          <div className="space-y-6 text-base text-text-muted leading-relaxed">
            <p>
              A economia é calculada comparando o <strong>Cenário Base</strong> (procedimentos padrão utilizando cabeceiras completas) com o <strong>Cenário Otimizado</strong> (utilizando interseções e trajetórias otimizadas).
            </p>
            <p>
              Para cada aeródromo, a ferramenta analisa e quantifica ganhos em:
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Redução de Taxiamento:</strong> Diferença de distância entre o pátio e a cabeceira principal versus a interseção autorizada.</li>
              <li><strong>Tempo de Rotação (ROT):</strong> Tempo médio de permanência na pista reduzido através de saídas e entradas mais eficientes.</li>
              <li><strong>Procedimentos OMNI:</strong> Ganhos em trajetórias de subida e descida otimizadas conforme padrões PBN/RNP.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
