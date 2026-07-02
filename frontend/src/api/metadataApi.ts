import type { Song, TrackMetadata } from "../types";
import { readMetadataCache, writeMetadataCache } from "../utils/metadataCache";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const BATCH_ENDPOINT = `${BASE_URL}/tracks/metadata/batch`;

const FLUSH_DELAY = 60; // ms — janela para agrupar pedidos de vários cards
const MAX_BATCH = 80;

type Resolver = (value: TrackMetadata) => void;

// Pedidos aguardando o próximo flush.
const pending = new Map<string, Resolver[]>();
// Pedidos já enviados ao backend (evita duplicar).
const inflight = new Map<string, Promise<TrackMetadata>>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function localFallback(trackId: string): TrackMetadata {
  return {
    trackId,
    title: "",
    artist: "",
    album: "",
    coverUrl: null,
    previewUrl: null,
    externalUrl: null,
    source: "fallback",
  };
}

async function flush(): Promise<void> {
  flushTimer = null;
  const ids = [...pending.keys()].slice(0, MAX_BATCH);
  if (ids.length === 0) return;

  const resolvers = new Map<string, Resolver[]>();
  for (const id of ids) {
    resolvers.set(id, pending.get(id) ?? []);
    pending.delete(id);
  }

  // Sobraram pedidos além do MAX_BATCH? Reagenda.
  if (pending.size > 0) scheduleFlush();

  let results: TrackMetadata[] = [];
  try {
    const response = await fetch(BATCH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackIds: ids }),
    });
    if (response.ok) {
      results = (await response.json()) as TrackMetadata[];
    }
  } catch {
    results = [];
  }

  const byId = new Map(results.map((r) => [r.trackId, r]));

  for (const id of ids) {
    const metadata = byId.get(id) ?? localFallback(id);
    writeMetadataCache(id, metadata);
    for (const resolve of resolvers.get(id) ?? []) resolve(metadata);
    inflight.delete(id);
  }
}

function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    void flush();
  }, FLUSH_DELAY);
}

function request(trackId: string): Promise<TrackMetadata> {
  const existing = inflight.get(trackId);
  if (existing) return existing;

  const promise = new Promise<TrackMetadata>((resolve) => {
    const list = pending.get(trackId);
    if (list) list.push(resolve);
    else pending.set(trackId, [resolve]);
  });

  inflight.set(trackId, promise);
  scheduleFlush();
  return promise;
}

export async function getTrackMetadata(song: Song): Promise<TrackMetadata> {
  const cached = readMetadataCache(song.track_id);
  if (cached) return cached;
  return request(song.track_id);
}

/** Pré-carrega metadados de várias faixas de uma vez (aproveita o cache). */
export function prefetchMetadata(songs: Song[]): void {
  for (const song of songs) {
    if (!readMetadataCache(song.track_id)) void request(song.track_id);
  }
}
