import { Injectable } from '@nestjs/common';
import { SongsService } from '../songs/songs.service';
import { EventsService } from '../events/events.service';
import { AudioFeatures, Song } from '../songs/song.interface';

type Centroid = AudioFeatures | null;

const W_GENRE = 1.6;
const W_FEATURES = 1.4;
const W_ARTIST = 1.0;
const W_POPULARITY = 0.6;
const W_EXPLORATION = 0.8;
const W_PLAYED_PENALTY = 0.5;

const CANDIDATES_PER_GENRE = 220;
const RANDOM_EXPLORE = 120;
const MAX_PER_ARTIST = 2;

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly songs: SongsService,
    private readonly events: EventsService,
  ) {}

  recommend(userId: string, limit: number, preferredGenres: string[]): Song[] {
    const history = this.events.getEvents(userId);

    const played: Song[] = [];
    const favorited: Song[] = [];
    const skipped = new Set<string>();
    const playedCount = new Map<string, number>();
    const searchTerms: string[] = [];

    for (const ev of history) {
      const song = ev.trackId ? this.songs.getById(ev.trackId) : undefined;
      switch (ev.type) {
        case 'play':
          if (song) {
            played.push(song);
            playedCount.set(
              song.track_id,
              (playedCount.get(song.track_id) ?? 0) + 1,
            );
          }
          break;
        case 'favorite':
          if (song) favorited.push(song);
          break;
        case 'skip':
          if (ev.trackId) skipped.add(ev.trackId);
          break;
        case 'search':
          if (ev.query) searchTerms.push(ev.query.toLowerCase());
          break;
        default:
          break;
      }
    }

    const genreWeights = this.buildGenreWeights(
      preferredGenres,
      played,
      favorited,
      searchTerms,
    );
    const artistWeights = this.buildArtistWeights(played, favorited);
    const maxArtist = Math.max(1, ...artistWeights.values());
    const centroid = this.buildCentroid(played, favorited);

    const candidates = this.collectCandidates(
      genreWeights,
      preferredGenres,
      skipped,
    );

    const maxGenreWeight = Math.max(1, ...genreWeights.values());

    const scored = candidates.map((song) => {
      const gAff =
        this.genreScore(song.track_genre.toLowerCase(), genreWeights) /
        maxGenreWeight;
      const fSim = centroid ? this.featureSimilarity(song, centroid) : 0.5;
      const aAff =
        (artistWeights.get(this.primaryArtist(song.artists)) ?? 0) / maxArtist;
      const pop = song.popularity / 100;

      const known = genreWeights.has(song.track_genre.toLowerCase());
      const exploration = Math.random() * (known ? 0.4 : 1);

      const timesPlayed = playedCount.get(song.track_id) ?? 0;
      const playedPenalty = Math.min(1, timesPlayed / 3);

      const score =
        W_GENRE * gAff +
        W_FEATURES * fSim +
        W_ARTIST * aAff +
        W_POPULARITY * pop +
        W_EXPLORATION * exploration -
        W_PLAYED_PENALTY * playedPenalty;

      return { song, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return this.diversify(scored, limit);
  }

  private buildGenreWeights(
    preferred: string[],
    played: Song[],
    favorited: Song[],
    searchTerms: string[],
  ): Map<string, number> {
    const weights = new Map<string, number>();
    const add = (genre: string, amount: number) => {
      const key = genre.toLowerCase();
      if (!key) return;
      weights.set(key, (weights.get(key) ?? 0) + amount);
    };

    for (const g of preferred) add(g, 3);
    for (const s of played) add(s.track_genre, 1);
    for (const s of favorited) add(s.track_genre, 2);

    if (searchTerms.length) {
      for (const { genre } of this.songs.getGenres()) {
        if (searchTerms.some((term) => term.includes(genre))) add(genre, 0.5);
      }
    }

    return weights;
  }

  private buildArtistWeights(
    played: Song[],
    favorited: Song[],
  ): Map<string, number> {
    const weights = new Map<string, number>();
    const add = (artists: string, amount: number) => {
      const key = this.primaryArtist(artists);
      if (!key) return;
      weights.set(key, (weights.get(key) ?? 0) + amount);
    };
    for (const s of played) add(s.artists, 1);
    for (const s of favorited) add(s.artists, 2);
    return weights;
  }

  private buildCentroid(played: Song[], favorited: Song[]): Centroid {
    const samples: Array<{ song: Song; weight: number }> = [
      ...played.map((song) => ({ song, weight: 1 })),
      ...favorited.map((song) => ({ song, weight: 2 })),
    ];
    if (!samples.length) return null;

    const acc: AudioFeatures = {
      danceability: 0,
      energy: 0,
      acousticness: 0,
      instrumentalness: 0,
      valence: 0,
      tempo: 0,
    };
    let totalWeight = 0;
    for (const { song, weight } of samples) {
      acc.danceability += song.danceability * weight;
      acc.energy += song.energy * weight;
      acc.acousticness += song.acousticness * weight;
      acc.instrumentalness += song.instrumentalness * weight;
      acc.valence += song.valence * weight;
      acc.tempo += song.tempo * weight;
      totalWeight += weight;
    }
    return {
      danceability: acc.danceability / totalWeight,
      energy: acc.energy / totalWeight,
      acousticness: acc.acousticness / totalWeight,
      instrumentalness: acc.instrumentalness / totalWeight,
      valence: acc.valence / totalWeight,
      tempo: acc.tempo / totalWeight,
    };
  }

  private featureSimilarity(song: Song, c: AudioFeatures): number {
    const d =
      (song.danceability - c.danceability) ** 2 +
      (song.energy - c.energy) ** 2 +
      (song.acousticness - c.acousticness) ** 2 +
      (song.instrumentalness - c.instrumentalness) ** 2 +
      (song.valence - c.valence) ** 2 +
      ((song.tempo - c.tempo) / 250) ** 2;
    const distance = Math.sqrt(d) / Math.sqrt(6);
    return 1 - Math.min(1, distance);
  }

  private genreScore(genre: string, weights: Map<string, number>): number {
    let total = 0;
    for (const [key, weight] of weights) {
      if (genre === key || genre.includes(key) || key.includes(genre)) {
        total += weight;
      }
    }
    return total;
  }

  private collectCandidates(
    genreWeights: Map<string, number>,
    preferred: string[],
    skipped: Set<string>,
  ): Song[] {
    const pool = new Map<string, Song>();

    const genres = new Set<string>([
      ...genreWeights.keys(),
      ...preferred.map((g) => g.toLowerCase()),
    ]);

    if (genres.size === 0) {
      const all = this.songs.getGenres();
      for (const g of this.sample(all, 4)) genres.add(g.genre);
    }

    for (const genre of genres) {
      const bucket = this.songs.getByGenre(genre);
      for (const song of this.sample(bucket, CANDIDATES_PER_GENRE)) {
        if (!skipped.has(song.track_id)) pool.set(song.track_id, song);
      }
    }

    for (const song of this.sample(this.songs.getAll(), RANDOM_EXPLORE)) {
      if (!skipped.has(song.track_id)) pool.set(song.track_id, song);
    }

    return [...pool.values()];
  }

  private diversify(
    scored: Array<{ song: Song; score: number }>,
    limit: number,
  ): Song[] {
    const perArtist = new Map<string, number>();
    const result: Song[] = [];
    for (const { song } of scored) {
      const artist = this.primaryArtist(song.artists);
      const count = perArtist.get(artist) ?? 0;
      if (count >= MAX_PER_ARTIST) continue;
      perArtist.set(artist, count + 1);
      result.push(song);
      if (result.length >= limit) break;
    }
    return result;
  }

  private primaryArtist(artists: string): string {
    return artists.split(';')[0].trim().toLowerCase();
  }

  private sample<T>(arr: T[], n: number): T[] {
    if (arr.length <= n) return arr;
    const result = arr.slice(0, n);
    for (let i = n; i < arr.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < n) result[j] = arr[i];
    }
    return result;
  }
}
