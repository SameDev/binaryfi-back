import { useState } from "react";
import type { Song } from "../types";
import { useTrackMetadata } from "../hooks/useTrackMetadata";

export function coverGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  const hue = Math.abs(hash);
  return `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${(hue + 40) % 360}, 60%, 22%))`;
}

type Props = {
  song: Song;
  className?: string;
};

export function TrackCover({ song, className }: Props) {
  const { metadata, loading } = useTrackMetadata(song);
  const [errored, setErrored] = useState(false);

  const artwork = !errored ? metadata?.artworkUrl : undefined;
  const showImage = Boolean(artwork);

  return (
    <div
      className={className ? `track-cover ${className}` : "track-cover"}
      style={
        showImage
          ? undefined
          : { background: coverGradient(song.track_id || song.track_name) }
      }
    >
      {showImage ? (
        <img
          src={artwork}
          alt={song.track_name}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : loading ? (
        <span className="cover-skeleton" />
      ) : (
        <span className="cover-initial">
          {song.track_name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
