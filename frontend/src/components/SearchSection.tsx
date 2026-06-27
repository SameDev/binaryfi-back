import { useEffect, useRef, useState } from "react";
import type { SearchBy, SearchResponse, Song } from "../types";
import { ApiConnectionError, searchSongs } from "../api/binaryfiApi";
import { MusicCard } from "./MusicCard";
import { SearchStats } from "./SearchStats";
import { BinaryStepsPanel } from "./BinaryStepsPanel";

type Props = {
  currentTrackId: string | null;
  isPlaying: boolean;
  isFavorite: (trackId: string) => boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onResults: (songs: Song[]) => void;
};

type ErrorKind = null | "connection" | "generic";

export function SearchSection({
  currentTrackId,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onResults,
}: Props) {
  const [query, setQuery] = useState("");
  const [by, setBy] = useState<SearchBy>("title");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (term.length === 0) {
      setResponse(null);
      setError(null);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(() => {
      const id = requestId.current + 1;
      requestId.current = id;
      setLoading(true);
      setError(null);

      searchSongs(term, by)
        .then((data) => {
          if (requestId.current !== id) return;
          setResponse(data);
          setLoading(false);
          if (data.results?.length) onResults(data.results);
        })
        .catch((err) => {
          if (requestId.current !== id) return;
          setLoading(false);
          setResponse(null);
          setError(err instanceof ApiConnectionError ? "connection" : "generic");
        });
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query, by, onResults]);

  const hasResults = response?.results && response.results.length > 0;

  return (
    <>
      <div className="search-hero">
        <h1 className="search-headline">O que você quer ouvir?</h1>
        <p className="search-subline">
          Busca binária real sobre o dataset do Spotify.
        </p>
      </div>

      <div className="search-sticky">
        <div className="search-sticky-inner">
          <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="search-input"
              placeholder={
                by === "title"
                  ? "Busque por título da música"
                  : "Busque por artista"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                aria-label="Limpar"
                onClick={() => setQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="search-toggle">
            <button
              type="button"
              className={by === "title" ? "toggle-option active" : "toggle-option"}
              onClick={() => setBy("title")}
            >
              Por título
            </button>
            <button
              type="button"
              className={by === "artist" ? "toggle-option active" : "toggle-option"}
              onClick={() => setBy("artist")}
            >
              Por artista
            </button>
          </div>
        </div>
      </div>

      <div className="search-results">
        {loading && (
          <div className="search-loading">
            <span className="spinner" />
            <span>Buscando...</span>
          </div>
        )}

        {!loading && error === "connection" && (
          <div className="search-message error">
            Não foi possível conectar ao backend. Verifique se a API está rodando
            em http://localhost:3000.
          </div>
        )}

        {!loading && error === "generic" && (
          <div className="search-message error">
            Algo deu errado na busca. Tente novamente.
          </div>
        )}

        {!loading && !error && response && !hasResults && (
          <div className="search-message">Nenhuma música encontrada.</div>
        )}

        {!loading && !error && response && hasResults && (
          <>
            <SearchStats algorithm={response.algorithm} stats={response.stats} />
            <BinaryStepsPanel steps={response.steps} />
            <div className="results-grid">
              {response.results.map((song) => (
                <MusicCard
                  key={song.track_id}
                  song={song}
                  isFavorite={isFavorite(song.track_id)}
                  isCurrent={currentTrackId === song.track_id}
                  isPlaying={isPlaying}
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
