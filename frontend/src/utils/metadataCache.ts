import type { TrackMetadata } from "../types";

const PREFIX = "binaryfi_metadata_";

export function readMetadataCache(trackId: string): TrackMetadata | null {
  try {
    const raw = localStorage.getItem(PREFIX + trackId);
    if (!raw) return null;
    return JSON.parse(raw) as TrackMetadata;
  } catch {
    return null;
  }
}

export function writeMetadataCache(trackId: string, metadata: TrackMetadata): void {
  try {
    localStorage.setItem(PREFIX + trackId, JSON.stringify(metadata));
  } catch {
    return;
  }
}
