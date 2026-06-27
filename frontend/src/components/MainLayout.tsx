import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MusicGenre, Song, User } from "../types";
import { searchSongs } from "../api/binaryfiApi";
import { uniqueSongs } from "../utils/uniqueSongs";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { Sidebar, type SectionId } from "./Sidebar";
import { Header } from "./Header";
import { SearchSection } from "./SearchSection";
import { MusicSection } from "./MusicSection";
import { AudioPlayer } from "./AudioPlayer";
import { NowPlayingPanel } from "./NowPlayingPanel";

type Props = {
  user: User;
  library: ReturnType<typeof useMusicLibrary>;
  onLogout: () => void;
};

const SEED_TERMS = ["a", "love", "you", "the", "baby", "night", "heart", "dance"];
const MAX_RECOMMENDATIONS = 12;
const PREFERENCE_WEIGHT = 2;
const LISTENED_WEIGHT = 1;

function buildGenreWeights(
  preferences: MusicGenre[],
  recent: Song[]
): Map<string, number> {
  const weights = new Map<string, number>();
  for (const genre of preferences) {
    const key = genre.toLowerCase();
    weights.set(key, (weights.get(key) ?? 0) + PREFERENCE_WEIGHT);
  }
  for (const song of recent) {
    const key = (song.track_genre || "").toLowerCase();
    if (!key) continue;
    weights.set(key, (weights.get(key) ?? 0) + LISTENED_WEIGHT);
  }
  return weights;
}

function genreScore(genre: string, weights: Map<string, number>): number {
  let total = 0;
  for (const [key, weight] of weights) {
    if (genre === key || genre.includes(key) || key.includes(genre)) {
      total += weight;
    }
  }
  return total;
}

export function MainLayout({ user, library, onLogout }: Props) {
  const {
    preferences,
    favorites,
    recent,
    discovered,
    playSong,
    toggleFavorite,
    isFavorite,
    addDiscovered,
  } = library;

  const player = useAudioPlayer();

  const [active, setActive] = useState<SectionId>("search");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const seeded = useRef(false);

  const sectionRefs = {
    recommendations: useRef<HTMLDivElement>(null),
    recent: useRef<HTMLDivElement>(null),
    favorites: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    let cancelled = false;
    setSeedLoading(true);

    Promise.allSettled(SEED_TERMS.map((term) => searchSongs(term, "title")))
      .then((settled) => {
        if (cancelled) return;
        const songs = settled
          .filter(
            (s): s is PromiseFulfilledResult<Awaited<ReturnType<typeof searchSongs>>> =>
              s.status === "fulfilled"
          )
          .flatMap((s) => s.value.results ?? []);
        addDiscovered(uniqueSongs(songs));
      })
      .finally(() => {
        if (!cancelled) setSeedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [addDiscovered]);

  const recommendations = useMemo(() => {
    const weights = buildGenreWeights(preferences, recent);
    if (weights.size === 0) return [];

    const exclude = new Set(
      [...recent, ...favorites].map((song) => song.track_id)
    );

    return uniqueSongs(discovered)
      .filter((song) => !exclude.has(song.track_id))
      .map((song) => ({
        song,
        score: genreScore((song.track_genre || "").toLowerCase(), weights),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.song.popularity - a.song.popularity)
      .slice(0, MAX_RECOMMENDATIONS)
      .map((entry) => entry.song);
  }, [discovered, preferences, recent, favorites]);

  const handlePlay = useCallback(
    (song: Song) => {
      playSong(song);
      player.play(song);
      setPanelOpen(true);
    },
    [playSong, player]
  );

  const handleNavigate = useCallback((section: SectionId) => {
    setActive(section);
    setSidebarOpen(false);
    if (section === "search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sectionRefs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const currentTrackId = player.current?.song.track_id ?? null;

  const recommendationsEmpty = seedLoading
    ? "Carregando recomendações..."
    : "Escute músicas ou escolha estilos para receber recomendações personalizadas.";

  const showPanel = Boolean(player.current) && panelOpen;

  const shellClasses = [
    "app-shell",
    player.current ? "with-player" : "",
    showPanel ? "with-panel" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClasses}>
      <Sidebar
        active={active}
        favoritesCount={favorites.length}
        recentCount={recent.length}
        open={sidebarOpen}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-main">
        <Header
          userName={user.name}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <main className="app-content">
          <SearchSection
            currentTrackId={currentTrackId}
            isPlaying={player.isPlaying}
            isFavorite={isFavorite}
            onPlay={handlePlay}
            onToggleFavorite={toggleFavorite}
            onResults={addDiscovered}
          />

          <div className="sections">
            <div ref={sectionRefs.recommendations}>
              <MusicSection
                title="Recomendações"
                icon="✧"
                songs={recommendations}
                emptyMessage={recommendationsEmpty}
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            <div ref={sectionRefs.recent}>
              <MusicSection
                title="Últimas escutadas"
                icon="↺"
                songs={recent}
                emptyMessage="Você não escutou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            <div ref={sectionRefs.favorites}>
              <MusicSection
                title="Minhas favoritas"
                icon="♥"
                songs={favorites}
                emptyMessage="Você não favoritou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </main>
      </div>

      {showPanel && player.current && (
        <NowPlayingPanel
          song={player.current.song}
          metadata={player.current.metadata}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {player.current && (
        <AudioPlayer
          current={player.current}
          status={player.status}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          onToggle={player.toggle}
          onPause={player.pause}
          onSeek={player.seek}
          onClose={player.close}
        />
      )}
    </div>
  );
}
