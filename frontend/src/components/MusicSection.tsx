import type { ReactNode } from "react";
import type { Song } from "../types";
import { EmptyState } from "./EmptyState";
import { HorizontalMusicRow } from "./HorizontalMusicRow";

type Props = {
  title: string;
  icon: string;
  songs: Song[];
  emptyMessage: string;
  currentTrackId: string | null;
  isPlaying: boolean;
  isFavorite: (trackId: string) => boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  action?: ReactNode;
};

export function MusicSection({
  title,
  icon,
  songs,
  emptyMessage,
  currentTrackId,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  action,
}: Props) {
  return (
    <section className="music-section">
      <header className="section-header">
        <span className="section-icon">{icon}</span>
        <h2 className="section-title">{title}</h2>
        {songs.length > 0 && <span className="section-count">{songs.length}</span>}
        {action && <div className="section-action">{action}</div>}
      </header>

      {songs.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <HorizontalMusicRow
          songs={songs}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          isFavorite={isFavorite}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </section>
  );
}
