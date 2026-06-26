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

type Props = {
  user: User;
  library: ReturnType<typeof useMusicLibrary>;
  onLogout: () => void;
};

const SEED_TERMS = ["a", "love", "you", "the", "baby", "night", "heart", "dance"];
const MAX_RECOMMENDATIONS = 12;

function matchesPreferences(song: Song, prefs: MusicGenre[]): boolean {
  const genre = (song.track_genre || "").toLowerCase();
  return prefs.some((p) => genre === p || genre.includes(p));
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
  const [seedLoading, setSeedLoading] = useState(false);
  const seeded = useRef(false);

  const sectionRefs = {
    search: useRef<HTMLDivElement>(null),
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
    return uniqueSongs(discovered)
      .filter((song) => matchesPreferences(song, preferences))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, MAX_RECOMMENDATIONS);
  }, [discovered, preferences]);

  const handlePlay = useCallback(
    (song: Song) => {
      playSong(song);
      player.play(song);
    },
    [playSong, player]
  );

  const handleNavigate = useCallback((section: SectionId) => {
    setActive(section);
    setSidebarOpen(false);
    sectionRefs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const currentTrackId = player.current?.song.track_id ?? null;

  const recommendationsEmpty = seedLoading
    ? "Carregando recomendações..."
    : "Não encontramos recomendações para seus estilos ainda.";

  return (
    <div className={player.current ? "app-shell with-player" : "app-shell"}>
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
          <div ref={sectionRefs.search}>
            <SearchSection
              currentTrackId={currentTrackId}
              isPlaying={player.isPlaying}
              isFavorite={isFavorite}
              onPlay={handlePlay}
              onToggleFavorite={toggleFavorite}
              onResults={addDiscovered}
            />
          </div>

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
