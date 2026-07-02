import { useCallback, useEffect, useRef, useState } from "react";
import type { Song, User } from "../types";
import { prefetchMetadata } from "../api/metadataApi";
import { useMusicLibrary } from "../hooks/useMusicLibrary";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useRecommendations } from "../hooks/useRecommendations";
import { useUserEvents } from "../hooks/useUserEvents";
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

const SKIP_THRESHOLD_SECONDS = 10;

export function MainLayout({ user, library, onLogout }: Props) {
  const { preferences, favorites, recent, playSong, toggleFavorite, isFavorite } =
    library;

  const player = useAudioPlayer();
  const events = useUserEvents(user.id);
  const { recommendations, loading: recsLoading, refresh: refreshRecs } =
    useRecommendations(user.id, preferences, 24);

  const [active, setActive] = useState<SectionId>("search");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const sectionRefs = {
    recommendations: useRef<HTMLDivElement>(null),
    recent: useRef<HTMLDivElement>(null),
    favorites: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    prefetchMetadata([...recommendations, ...recent, ...favorites]);
  }, [recommendations, recent, favorites]);

  const handlePlay = useCallback(
    (song: Song) => {
      const prev = player.current;
      if (
        prev &&
        prev.song.track_id !== song.track_id &&
        player.isPlaying &&
        player.currentTime < SKIP_THRESHOLD_SECONDS
      ) {
        events.skip(prev.song);
      }

      playSong(song);
      player.play(song);
      events.play(song);
      refreshRecs();
      setPanelOpen(true);
    },
    [playSong, player, events, refreshRecs]
  );

  const handleToggleFavorite = useCallback(
    (song: Song) => {
      const wasFavorite = isFavorite(song.track_id);
      toggleFavorite(song);
      if (wasFavorite) events.unfavorite(song);
      else events.favorite(song);
      refreshRecs();
    },
    [isFavorite, toggleFavorite, events, refreshRecs]
  );

  const handleSearchResults = useCallback((songs: Song[]) => {
    prefetchMetadata(songs);
  }, []);

  const handleSearchQuery = useCallback(
    (query: string) => {
      events.search(query);
      refreshRecs();
    },
    [events, refreshRecs]
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

  const recommendationsEmpty = recsLoading
    ? "Carregando recomendações..."
    : "Escolha estilos ou escute músicas para receber recomendações personalizadas.";

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
            onToggleFavorite={handleToggleFavorite}
            onResults={handleSearchResults}
            onSearch={handleSearchQuery}
          />

          <div className="sections">
            <div className="section-anchor" ref={sectionRefs.recommendations}>
              <MusicSection
                title="Recomendações"
                icon="✧"
                songs={recommendations}
                emptyMessage={recommendationsEmpty}
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>

            <div className="section-anchor" ref={sectionRefs.recent}>
              <MusicSection
                title="Últimas escutadas"
                icon="↺"
                songs={recent}
                emptyMessage="Você não escutou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>

            <div className="section-anchor" ref={sectionRefs.favorites}>
              <MusicSection
                title="Minhas favoritas"
                icon="♥"
                songs={favorites}
                emptyMessage="Você não favoritou nenhuma música ainda."
                currentTrackId={currentTrackId}
                isPlaying={player.isPlaying}
                isFavorite={isFavorite}
                onPlay={handlePlay}
                onToggleFavorite={handleToggleFavorite}
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
          onSeek={player.seek}
          onClose={player.close}
        />
      )}
    </div>
  );
}
