import { useState } from "react";
import type { SearchBy, SearchStep } from "../types";

type Props = {
  steps: SearchStep[];
  by: SearchBy;
};

const FIELD_LABELS: Record<SearchBy, string> = {
  title: "título da música (track_name)",
  artist: "artista (artists)",
};

const ACTION_LABELS: Record<string, string> = {
  go_left: "← esquerda",
  go_right: "direita →",
  found_continue_left: "✓ encontrado",
  not_found: "✕ fim",
};

export function BinaryStepsPanel({ steps, by }: Props) {
  const [open, setOpen] = useState(false);

  if (!steps.length) return null;

  const visible = steps.slice(0, 8);

  return (
    <div className="steps-panel">
      <button
        type="button"
        className="steps-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Ocultar" : "Ver"} passos da busca binária ({steps.length})
      </button>

      {open && (
        <>
          <p className="steps-explain">
            <strong>Busca Binária:</strong> é o método tradicional de busca
            binária, adequado para encontrar um único elemento em um array
            ordenado. Ela divide repetidamente o intervalo de busca pela metade
            até encontrar o item desejado ou concluir que ele não existe. O array
            é ordenado e pesquisado pelo campo <em>{FIELD_LABELS[by]}</em>.
          </p>
          <div className="steps-table" role="table">
          <div className="steps-row steps-head" role="row">
            <span>#</span>
            <span>low</span>
            <span>mid</span>
            <span>high</span>
            <span>comparando</span>
            <span>ação</span>
          </div>
          {visible.map((step) => (
            <div className="steps-row" role="row" key={step.step}>
              <span>{step.step}</span>
              <span>{step.low}</span>
              <span>{step.mid}</span>
              <span>{step.high}</span>
              <span className="step-compare" title={step.comparing}>
                {step.comparing}
              </span>
              <span className={`step-action step-${step.action}`}>
                {ACTION_LABELS[step.action] ?? step.action}
              </span>
            </div>
          ))}
          {steps.length > 8 && (
            <p className="steps-more">
              Mostrando os primeiros 8 de {steps.length} passos.
            </p>
          )}
          </div>
        </>
      )}
    </div>
  );
}
