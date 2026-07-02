import type { TrackMetadata } from "../types";

const PREFIX = "binaryfi_metadata_";
const POSITIVE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
const NEGATIVE_TTL = 10 * 60 * 1000; // 10 minutos

type CacheEntry = {
  value: TrackMetadata;
  storedAt: number;
};

function isPositive(metadata: TrackMetadata): boolean {
  return Boolean(metadata.coverUrl) && metadata.source !== "fallback";
}

/**
 * Lê o cache respeitando TTL. Cache positivo (com capa) dura dias;
 * fallback sem capa expira rápido para tentar atualizar depois.
 */
export function readMetadataCache(trackId: string): TrackMetadata | null {
  try {
    const raw = localStorage.getItem(PREFIX + trackId);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry?.value) return null;

    const ttl = isPositive(entry.value) ? POSITIVE_TTL : NEGATIVE_TTL;
    if (Date.now() - entry.storedAt > ttl) return null;

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
