import type { Song } from "../types";
import { EmptyState } from "./EmptyState";
import { MusicCard } from "./MusicCard";

type Props = {
  title: string;
  icon: string;
  songs: Song[];
  emptyMessage: string;
  currentTrackId: string | null;
  isFavorite: (trackId: string) => boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
};

export function MusicColumn({
  title,
  icon,
  songs,
  emptyMessage,
  currentTrackId,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: Props) {
  return (
    <section className="music-column" id={`column-${title}`}>
      <header className="column-header">
        <span className="column-icon">{icon}</span>
        <h2>{title}</h2>
        <span className="column-count">{songs.length}</span>
      </header>

      <div className="column-body">
        {songs.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          songs.map((song) => (
            <MusicCard
              key={song.track_id}
              song={song}
              isFavorite={isFavorite(song.track_id)}
              isPlaying={currentTrackId === song.track_id}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </section>
  );
}
