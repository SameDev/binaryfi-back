import type { Song } from "../types";
import { formatDuration } from "../utils/formatDuration";
import { TrackCover } from "./TrackCover";

type Props = {
  song: Song;
  isFavorite: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
};

export function MusicCard({
  song,
  isFavorite,
  isCurrent,
  isPlaying,
  onPlay,
  onToggleFavorite,
}: Props) {
  const showPause = isCurrent && isPlaying;

  return (
    <article className={isCurrent ? "music-card current" : "music-card"}>
      <div className="card-cover-wrap">
        <TrackCover song={song} />
        <button
          type="button"
          className="cover-play"
          aria-label={showPause ? "Pausar" : "Tocar"}
          onClick={() => onPlay(song)}
        >
          {showPause ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className={isFavorite ? "card-fav active" : "card-fav"}
          aria-label={isFavorite ? "Desfavoritar" : "Favoritar"}
          onClick={() => onToggleFavorite(song)}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-info">
        <h3 className="card-title" title={song.track_name}>
          {song.track_name}
        </h3>
        <p className="card-artist" title={song.artists}>
          {song.artists}
        </p>
        <div className="card-meta">
          <span className="genre-tag">{song.track_genre}</span>
          <span className="card-duration">{formatDuration(song.duration_ms)}</span>
        </div>
      </div>
    </article>
  );
}
