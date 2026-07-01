import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SongsService } from '../songs/songs.service';
import { Song } from '../songs/song.interface';
import { MemoryCache } from '../common/memory-cache';
import { MetadataSource, TrackMetadata } from './track-metadata.interface';

const POSITIVE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const NEGATIVE_TTL_MS = 15 * 60 * 1000; // 15 minutos
const FETCH_TIMEOUT_MS = 4000;
const BATCH_CONCURRENCY = 6;

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  private readonly cache = new MemoryCache<TrackMetadata>();
  private readonly inflight = new Map<string, Promise<TrackMetadata>>();

  private spotifyToken: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly songs: SongsService,
    private readonly config: ConfigService,
  ) {}

  private get spotifyEnabled(): boolean {
    return (
      !!this.config.get<string>('SPOTIFY_CLIENT_ID') &&
      !!this.config.get<string>('SPOTIFY_CLIENT_SECRET')
    );
  }

  /** Resolve metadados de uma faixa, usando cache e coalescendo requisições. */
  async getOne(trackId: string): Promise<TrackMetadata> {
    const cached = this.cache.get(trackId);
    if (cached) return cached;

    const existing = this.inflight.get(trackId);
    if (existing) return existing;

    const promise = this.resolve(trackId).finally(() =>
      this.inflight.delete(trackId),
    );
    this.inflight.set(trackId, promise);
    return promise;
  }

  /** Resolve vários IDs de uma vez, com concorrência limitada. */
  async getMany(trackIds: string[]): Promise<TrackMetadata[]> {
    const unique = [...new Set(trackIds)];
    const out: TrackMetadata[] = [];

    for (let i = 0; i < unique.length; i += BATCH_CONCURRENCY) {
      const chunk = unique.slice(i, i + BATCH_CONCURRENCY);
      const resolved = await Promise.all(chunk.map((id) => this.getOne(id)));
      out.push(...resolved);
    }
    return out;
  }

  private async resolve(trackId: string): Promise<TrackMetadata> {
    const song = this.songs.getById(trackId);
    const base = this.baseMetadata(trackId, song);

    // Ordem de prioridade: Spotify -> Deezer -> iTunes -> fallback.
    const providers: Array<() => Promise<Partial<TrackMetadata> | null>> = [];
    if (this.spotifyEnabled) providers.push(() => this.fromSpotify(trackId));
    if (song) {
      providers.push(() => this.fromDeezer(song));
      providers.push(() => this.fromItunes(song));
    }

    for (const provider of providers) {
      try {
        const found = await provider();
        if (found?.coverUrl) {
          const result: TrackMetadata = { ...base, ...found };
          // Preserva o link externo do Spotify se o provedor não trouxe um.
          if (!result.externalUrl) result.externalUrl = base.externalUrl;
          this.cache.set(trackId, result, POSITIVE_TTL_MS);
          return result;
        }
        // Se não achou capa mas veio preview, guardamos para o fallback.
        if (found?.previewUrl && !base.previewUrl) {
          base.previewUrl = found.previewUrl;
          base.source = found.source ?? base.source;
        }
      } catch (err) {
        this.logger.debug(`Provider falhou para ${trackId}: ${String(err)}`);
      }
    }

    // Nada encontrado: fallback com TTL curto para tentar novamente em breve.
    const fallback: TrackMetadata = { ...base, source: 'fallback' };
    this.cache.set(trackId, fallback, NEGATIVE_TTL_MS);
    return fallback;
  }

  private baseMetadata(trackId: string, song?: Song): TrackMetadata {
    const isSpotifyId = /^[a-zA-Z0-9]{22}$/.test(trackId);
    return {
      trackId,
      title: song?.track_name ?? '',
      artist: song?.artists ?? '',
      album: song?.album_name ?? '',
      coverUrl: null,
      previewUrl: null,
      externalUrl: isSpotifyId
        ? `https://open.spotify.com/track/${trackId}`
        : null,
      source: 'fallback',
    };
  }

  private primaryArtist(artists: string): string {
    return artists.split(';')[0].trim();
  }

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private async fromDeezer(
    song: Song,
  ): Promise<Partial<TrackMetadata> | null> {
    const artist = this.primaryArtist(song.artists);
    const q = `artist:"${artist}" track:"${song.track_name}"`;
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`;

    const data = await this.fetchJson<{
      data?: Array<{
        preview?: string;
        link?: string;
        album?: { cover_xl?: string; cover_big?: string };
      }>;
    }>(url);

    const hit = data.data?.[0];
    const cover = hit?.album?.cover_xl || hit?.album?.cover_big;
    if (!hit || !cover) return null;

    return {
      coverUrl: cover,
      previewUrl: hit.preview || null,
      externalUrl: hit.link || undefined,
      source: 'deezer' as MetadataSource,
    };
  }

  private async fromItunes(
    song: Song,
  ): Promise<Partial<TrackMetadata> | null> {
    const artist = this.primaryArtist(song.artists);
    // Usa artista + música + álbum (não só artista + música).
    const term = `${artist} ${song.track_name} ${song.album_name}`.trim();
    const url =
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
      `&media=music&entity=song&limit=1`;

    const data = await this.fetchJson<{
      results?: Array<{
        previewUrl?: string;
        artworkUrl100?: string;
        trackViewUrl?: string;
      }>;
    }>(url);

    const hit = data.results?.[0];
    if (!hit?.artworkUrl100) return null;

    return {
      coverUrl: hit.artworkUrl100.replace('100x100bb', '600x600bb'),
      previewUrl: hit.previewUrl || null,
      externalUrl: hit.trackViewUrl || undefined,
      source: 'itunes' as MetadataSource,
    };
  }

  private async getSpotifyToken(): Promise<string | null> {
    if (this.spotifyToken && this.spotifyToken.expiresAt > Date.now()) {
      return this.spotifyToken.value;
    }
    const id = this.config.get<string>('SPOTIFY_CLIENT_ID');
    const secret = this.config.get<string>('SPOTIFY_CLIENT_SECRET');
    if (!id || !secret) return null;

    const basic = Buffer.from(`${id}:${secret}`).toString('base64');
    const data = await this.fetchJson<{
      access_token?: string;
      expires_in?: number;
    }>('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!data.access_token) return null;
    this.spotifyToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    };
    return this.spotifyToken.value;
  }

  private async fromSpotify(
    trackId: string,
  ): Promise<Partial<TrackMetadata> | null> {
    if (!/^[a-zA-Z0-9]{22}$/.test(trackId)) return null;
    const token = await this.getSpotifyToken();
    if (!token) return null;

    const data = await this.fetchJson<{
      preview_url?: string;
      external_urls?: { spotify?: string };
      album?: { images?: Array<{ url?: string }> };
    }>(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cover = data.album?.images?.[0]?.url;
    if (!cover) return null;

    return {
      coverUrl: cover,
      previewUrl: data.preview_url || null,
      externalUrl: data.external_urls?.spotify || undefined,
      source: 'spotify' as MetadataSource,
    };
  }
}
