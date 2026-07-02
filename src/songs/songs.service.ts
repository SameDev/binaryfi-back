import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Song } from './song.interface';

export type GenreInfo = { genre: string; count: number };

@Injectable()
export class SongsService implements OnModuleInit {
  private readonly logger = new Logger(SongsService.name);

  private allSongs: Song[] = [];
  private songsByTitle: Song[] = [];
  private songsByArtist: Song[] = [];
  private byId = new Map<string, Song>();
  private byGenre = new Map<string, Song[]>();
  private genres: GenreInfo[] = [];

  onModuleInit() {
    this.loadDataset();
  }

  private parseCSVRow(row: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields;
  }

  private num(value: string): number {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }

  private loadDataset() {
    // __dirname = src/songs (dev) or dist/songs (prod); assets is one level up
    const csvPath = path.join(__dirname, '..', 'assets', 'dataset.csv');
    const t0 = Date.now();

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    const songs: Song[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const f = this.parseCSVRow(line);
      if (f.length < 21) continue;

      const song: Song = {
        track_id: f[1],
        artists: f[2],
        album_name: f[3],
        track_name: f[4],
        popularity: parseInt(f[5]) || 0,
        duration_ms: parseInt(f[6]) || 0,
        explicit: f[7] === 'True',
        danceability: this.num(f[8]),
        energy: this.num(f[9]),
        acousticness: this.num(f[14]),
        instrumentalness: this.num(f[15]),
        valence: this.num(f[17]),
        tempo: this.num(f[18]),
        track_genre: f[20] || '',
      };
      songs.push(song);

      if (!this.byId.has(song.track_id)) {
        this.byId.set(song.track_id, song);
      }

      const g = song.track_genre.toLowerCase();
      if (g) {
        const bucket = this.byGenre.get(g);
        if (bucket) bucket.push(song);
        else this.byGenre.set(g, [song]);
      }
    }

    this.allSongs = songs;

    const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

    this.songsByTitle = [...songs].sort((a, b) =>
      cmp(a.track_name.toLowerCase(), b.track_name.toLowerCase()),
    );

    this.songsByArtist = [...songs].sort((a, b) =>
      cmp(a.artists.toLowerCase(), b.artists.toLowerCase()),
    );

    this.genres = [...this.byGenre.entries()]
      .map(([genre, list]) => ({ genre, count: list.length }))
      .sort((a, b) => a.genre.localeCompare(b.genre));

    this.logger.log(
      `Loaded ${songs.length} songs (${this.byId.size} únicas, ${this.genres.length} gêneros) em ${Date.now() - t0}ms`,
    );
  }

  getSongsByTitle(): Song[] {
    return this.songsByTitle;
  }

  getSongsByArtist(): Song[] {
    return this.songsByArtist;
  }

  getAll(): Song[] {
    return this.allSongs;
  }

  getById(trackId: string): Song | undefined {
    return this.byId.get(trackId);
  }

  getByGenre(genre: string): Song[] {
    return this.byGenre.get(genre.toLowerCase()) ?? [];
  }

  getGenres(): GenreInfo[] {
    return this.genres;
  }

  getTotalCount(): number {
    return this.songsByTitle.length;
  }
}
