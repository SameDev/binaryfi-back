import { useEffect, useState } from "react";
import type { Song, TrackMetadata } from "../types";
import { getTrackMetadata } from "../api/metadataApi";
import { readMetadataCache } from "../utils/metadataCache";

export function useTrackMetadata(song: Song) {
  const [metadata, setMetadata] = useState<TrackMetadata | null>(() =>
    readMetadataCache(song.track_id)
  );
  const [loading, setLoading] = useState(metadata === null);

  useEffect(() => {
    const cached = readMetadataCache(song.track_id);
    if (cached) {
      setMetadata(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getTrackMetadata(song)
      .then((result) => {
        if (!cancelled) setMetadata(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [song.track_id]);

  return { metadata, loading };
}
