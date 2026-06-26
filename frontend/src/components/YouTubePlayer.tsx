import type { Song, YouTubeVideo } from "../types";

type Props = {
  video: YouTubeVideo;
  song: Song;
  visible: boolean;
  compact: boolean;
  onToggleVisible: () => void;
  onClose: () => void;
};

export function YouTubePlayer({
  video,
  song,
  visible,
  compact,
  onToggleVisible,
  onClose,
}: Props) {
  if (!visible) return null;

  const src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;

  return (
    <div
      className={
        compact
          ? "youtube-player youtube-player-compact"
          : "youtube-player youtube-player-expanded"
      }
    >
      <div className="youtube-frame">
        <iframe
          src={src}
          title={`${song.track_name} — ${song.artists}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="youtube-info">
        <div className="youtube-meta">
          <span className="youtube-song" title={song.track_name}>
            {song.track_name}
          </span>
          <span className="youtube-artist" title={song.artists}>
            {song.artists}
          </span>
          {!compact && (
            <>
              <span className="youtube-video-title" title={video.title}>
                {video.title}
              </span>
              {video.channelTitle && (
                <span className="youtube-channel">{video.channelTitle}</span>
              )}
            </>
          )}
        </div>

        <div className="youtube-actions">
          <button type="button" className="yt-btn" onClick={onToggleVisible}>
            {compact ? "Mostrar vídeo" : "Ocultar vídeo"}
          </button>
          <a
            className="yt-btn yt-link"
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            Abrir no YouTube
          </a>
          <button type="button" className="yt-btn yt-close" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
