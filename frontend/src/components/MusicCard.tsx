import type { Song } from "../types";
import { formatDuration } from "../utils/formatDuration";

type Props = {
  song: Song;
  isFavorite: boolean;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
};

function coverGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  const hue = Math.abs(hash);
  return `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${(hue + 40) % 360}, 60%, 22%))`;
}

export function MusicCard({
  song,
  isFavorite,
  isPlaying,
  onPlay,
  onToggleFavorite,
}: Props) {
  return (
    <article className={isPlaying ? "music-card playing" : "music-card"}>
      <div
        className="music-cover"
        style={{ background: coverGradient(song.track_id || song.track_name) }}
      >
        <span className="music-cover-initial">
          {song.track_name.charAt(0).toUpperCase()}
        </span>
        <button
          type="button"
          className="cover-play"
          aria-label="Tocar"
          onClick={() => onPlay(song)}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>

      <div className="music-info">
        <h3 className="music-title" title={song.track_name}>
          {song.track_name}
        </h3>
        <p className="music-artist" title={song.artists}>
          {song.artists}
        </p>
        <p className="music-album" title={song.album_name}>
          {song.album_name}
        </p>

        <div className="music-meta">
          <span className="genre-tag">{song.track_genre}</span>
          <span className="meta-dot">•</span>
          <span>★ {song.popularity}</span>
          <span className="meta-dot">•</span>
          <span>{formatDuration(song.duration_ms)}</span>
        </div>
      </div>

      <div className="music-actions">
        <button
          type="button"
          className="btn btn-play"
          onClick={() => onPlay(song)}
        >
          {isPlaying ? "Tocando" : "Tocar"}
        </button>
        <button
          type="button"
          className={isFavorite ? "btn-fav active" : "btn-fav"}
          aria-label="Favoritar"
          onClick={() => onToggleFavorite(song)}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}
