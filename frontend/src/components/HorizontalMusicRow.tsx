import type { Song } from "../types";
import { MusicCard } from "./MusicCard";

type Props = {
  songs: Song[];
  currentTrackId: string | null;
  isPlaying: boolean;
  isFavorite: (trackId: string) => boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
};

export function HorizontalMusicRow({
  songs,
  currentTrackId,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: Props) {
  return (
    <div className="music-row">
      {songs.map((song) => (
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
  );
}
