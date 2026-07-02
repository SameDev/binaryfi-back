import type { PlayerTrack } from "../types";
import type { PlayerStatus } from "../hooks/useAudioPlayer";
import { coverGradient } from "./TrackCover";
import { externalLinkLabel } from "../utils/metadataLabels";
import { getYouTubeSearchUrl } from "../api/youtubeApi";

type Props = {
  current: PlayerTrack;
  status: PlayerStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
};

function formatSeconds(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  current,
  status,
  isPlaying,
  currentTime,
  duration,
  onToggle,
  onSeek,
  onClose,
}: Props) {
  const { song, metadata } = current;
  const artwork = metadata.coverUrl;
  const externalLabel = externalLinkLabel(metadata.source);

  const searchOnYouTube = () => {
    window.open(getYouTubeSearchUrl(song), "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="audio-player">
      <div className="player-track">
        <div
          className="player-cover"
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
        <div className="player-info">
          <span className="player-title" title={song.track_name}>
            {song.track_name}
          </span>
          <span className="player-artist" title={song.artists}>
            {song.artists}
          </span>
        </div>
      </div>

      <div className="player-controls">
        {status === "loading" && (
          <div className="player-status">
            <span className="spinner" />
          </div>
        )}

        {status === "unavailable" && (
          <div className="player-status unavailable">
            Prévia de áudio indisponível para esta música.
          </div>
        )}

        {status === "ready" && (
          <>
            <button
              type="button"
              className="player-play"
              aria-label={isPlaying ? "Pausar" : "Tocar"}
              onClick={onToggle}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <div className="player-progress">
              <span className="player-time">{formatSeconds(currentTime)}</span>
              <input
                type="range"
                aria-label="Progresso da música"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
              />
              <span className="player-time">{formatSeconds(duration)}</span>
            </div>
          </>
        )}
      </div>

      <div className="player-actions">
        <button
          type="button"
          className="player-youtube"
          onClick={searchOnYouTube}
        >
          Buscar no YouTube
        </button>
        {metadata.externalUrl && (
          <a
            className="player-external"
            href={metadata.externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {externalLabel}
          </a>
        )}
        <button
          type="button"
          className="player-close"
          aria-label="Fechar player"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </footer>
  );
}
