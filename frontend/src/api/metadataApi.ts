import type { Song, TrackMetadata } from "../types";
import { readMetadataCache, writeMetadataCache } from "../utils/metadataCache";

const ITUNES_URL = "https://itunes.apple.com/search";

type ItunesResult = {
  previewUrl?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

const inflight = new Map<string, Promise<TrackMetadata>>();

function looksLikeSpotifyId(trackId: string): boolean {
  return /^[a-zA-Z0-9]{22}$/.test(trackId);
}

function upscaleArtwork(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace("100x100bb", "600x600bb");
}

async function fetchFromItunes(song: Song): Promise<TrackMetadata | null> {
  const term = `${song.artists} ${song.track_name}`.trim();
  const url = `${ITUNES_URL}?term=${encodeURIComponent(
    term
  )}&media=music&entity=song&limit=1`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as { results?: ItunesResult[] };
  const result = data.results?.[0];
  if (!result) return null;

  return {
    previewUrl: result.previewUrl,
    artworkUrl: upscaleArtwork(result.artworkUrl100),
    externalUrl: result.trackViewUrl,
    source: "itunes",
  };
}

function spotifyFallback(song: Song): TrackMetadata {
  if (looksLikeSpotifyId(song.track_id)) {
    return {
      externalUrl: `https://open.spotify.com/track/${song.track_id}`,
      source: "spotify",
    };
  }
  return { source: "none" };
}

async function resolveMetadata(song: Song): Promise<TrackMetadata> {
  try {
    const itunes = await fetchFromItunes(song);
    if (itunes && (itunes.previewUrl || itunes.artworkUrl)) {
      writeMetadataCache(song.track_id, itunes);
      return itunes;
    }
  } catch {
    return spotifyFallback(song);
  }

  const fallback = spotifyFallback(song);
  if (fallback.source === "spotify") {
    writeMetadataCache(song.track_id, fallback);
  }
  return fallback;
}

export async function getTrackMetadata(song: Song): Promise<TrackMetadata> {
  const cached = readMetadataCache(song.track_id);
  if (cached) return cached;

  const existing = inflight.get(song.track_id);
  if (existing) return existing;

  const promise = resolveMetadata(song).finally(() => {
    inflight.delete(song.track_id);
  });
  inflight.set(song.track_id, promise);
  return promise;
}
