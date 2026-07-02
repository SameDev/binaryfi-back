import type { SearchBy, SearchStats as Stats } from "../types";

type Props = {
  algorithm: string;
  stats: Stats;
  by: SearchBy;
};

const FIELD_LABELS: Record<SearchBy, string> = {
  title: "título",
  artist: "artista",
};

export function SearchStats({ algorithm, stats, by }: Props) {
  return (
    <div className="search-stats">
      <span className="stats-badge">Busca Binária ativa</span>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">Algoritmo</span>
          <span className="stat-value">{algorithm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Campo ordenado</span>
          <span className="stat-value">{FIELD_LABELS[by]}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Comparações</span>
          <span className="stat-value">{stats.comparisons}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tempo</span>
          <span className="stat-value">{stats.timeMs} ms</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total no dataset</span>
          <span className="stat-value">
            {stats.totalSongs.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
