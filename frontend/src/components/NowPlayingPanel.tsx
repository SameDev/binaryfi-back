import type { Song, TrackMetadata } from "../types";
import { formatDuration } from "../utils/formatDuration";
import { coverGradient } from "./TrackCover";

type Props = {
  song: Song;
  metadata: TrackMetadata;
  onClose: () => void;
};

export function NowPlayingPanel({ song, metadata, onClose }: Props) {
  const artwork = metadata.artworkUrl;
  const externalLabel =
    metadata.source === "spotify"
      ? "Abrir no Spotify"
      : metadata.source === "itunes"
        ? "Abrir no iTunes"
        : null;

  return (
    <aside className="now-playing">
      <header className="np-header">
        <span className="np-eyebrow">Tocando agora</span>
        <button
          type="button"
          className="np-close"
          aria-label="Fechar painel"
          onClick={onClose}
        >
          ✕
        </button>
      </header>

      <div
        className="np-cover"
        style={
          artwork
            ? undefined
            : { background: coverGradient(song.track_id || song.track_name) }
        }
      >
        {artwork ? (
          <img src={artwork} alt={song.track_name} />
        ) : (
          <span>{song.track_name.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <h2 className="np-song" title={song.track_name}>
        {song.track_name}
      </h2>
      <p className="np-artist" title={song.artists}>
        {song.artists}
      </p>

      <dl className="np-info">
        <div className="np-row">
          <dt>Álbum</dt>
          <dd title={song.album_name}>{song.album_name}</dd>
        </div>
        <div className="np-row">
          <dt>Gênero</dt>
          <dd>
            <span className="genre-tag">{song.track_genre}</span>
          </dd>
        </div>
        <div className="np-row">
          <dt>Duração</dt>
          <dd>{formatDuration(song.duration_ms)}</dd>
        </div>
        <div className="np-row">
          <dt>Popularidade</dt>
          <dd>{song.popularity}/100</dd>
        </div>
      </dl>

      <div className="np-pop">
        <div className="np-pop-bar">
          <span style={{ width: `${Math.max(0, Math.min(100, song.popularity))}%` }} />
        </div>
      </div>

      {externalLabel && metadata.externalUrl && (
        <a
          className="np-external"
          href={metadata.externalUrl}
          target="_blank"
          rel="noreferrer"
        >
          {externalLabel}
        </a>
      )}
    </aside>
  );
}
