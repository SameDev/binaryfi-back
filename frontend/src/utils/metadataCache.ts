import type { TrackMetadata } from "../types";

const PREFIX = "binaryfi_metadata_v2_";
const FULL_TTL = 7 * 24 * 60 * 60 * 1000; 
const COVER_ONLY_TTL = 60 * 60 * 1000; 
const NEGATIVE_TTL = 10 * 60 * 1000; 

type CacheEntry = {
  value: TrackMetadata;
  storedAt: number;
};

function ttlFor(metadata: TrackMetadata): number {
  if (!metadata.coverUrl) return NEGATIVE_TTL;
  return metadata.previewUrl ? FULL_TTL : COVER_ONLY_TTL;
}

export function readMetadataCache(trackId: string): TrackMetadata | null {
  try {
    const raw = localStorage.getItem(PREFIX + trackId);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry?.value) return null;

    if (Date.now() - entry.storedAt > ttlFor(entry.value)) return null;

    return entry.value;
  } catch {
    return null;
  }
}

export function writeMetadataCache(
  trackId: string,
  metadata: TrackMetadata
): void {
  try {
    const entry: CacheEntry = { value: metadata, storedAt: Date.now() };
    localStorage.setItem(PREFIX + trackId, JSON.stringify(entry));
  } catch {
    return;
  }
}
