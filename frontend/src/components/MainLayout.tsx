import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MusicGenre, Song, User } from "../types";
import { searchSongs } from "../api/binaryfiApi";
import { uniqueSongs } from "../utils/uniqueSongs";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { Sidebar, type SectionId } from "./Sidebar";
import { Header } from "./Header";
import { SearchSection } from "./SearchSection";
import { MusicColumn } from "./MusicColumn";

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

  const currentTrackId = recent[0]?.track_id ?? null;

  const handleNavigate = useCallback((section: SectionId) => {
    setActive(section);
    setSidebarOpen(false);
    sectionRefs[section].current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const recommendationsEmpty = seedLoading
    ? "Carregando recomendações..."
    : "Não encontramos recomendações para seus estilos ainda. Pesquise algumas músicas para melhorar suas recomendações.";

  return (
    <div className="app-shell">
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
              isFavorite={isFavorite}
              onPlay={playSong}
              onToggleFavorite={toggleFavorite}
              onResults={addDiscovered}
            />
          </div>

          <div className="columns">
            <div ref={sectionRefs.recommendations}>
              <MusicColumn
                title="Recomendações"
                icon="✧"
                songs={recommendations}
                emptyMessage={recommendationsEmpty}
                currentTrackId={currentTrackId}
                isFavorite={isFavorite}
                onPlay={playSong}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            <div ref={sectionRefs.recent}>
              <MusicColumn
                title="Últimas escutadas"
                icon="↺"
                songs={recent}
                emptyMessage="Você não escutou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isFavorite={isFavorite}
                onPlay={playSong}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            <div ref={sectionRefs.favorites}>
              <MusicColumn
                title="Minhas favoritas"
                icon="♥"
                songs={favorites}
                emptyMessage="Você não favoritou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isFavorite={isFavorite}
                onPlay={playSong}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
