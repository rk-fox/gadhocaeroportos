import React from 'react';
import { BookOpen, Info, FileText, HelpCircle, Layers, Settings } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-display font-extrabold text-text-main tracking-tight">
          Sobre o Projeto GADHOC
        </h2>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          O GADHOC (Gestão de Aeródromos e Otimização de Combustível) é uma ferramenta analítica de suporte à decisão para gestores aeroportuários e operacionais.
        </p>
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
