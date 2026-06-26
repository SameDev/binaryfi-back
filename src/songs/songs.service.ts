import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Song } from './song.interface';

@Injectable()
export class SongsService implements OnModuleInit {
  private readonly logger = new Logger(SongsService.name);
  private songsByTitle: Song[] = [];
  private songsByArtist: Song[] = [];

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
      if (f.length < 6) continue;

      songs.push({
        track_id: f[1],
        artists: f[2],
        album_name: f[3],
        track_name: f[4],
        popularity: parseInt(f[5]) || 0,
        duration_ms: parseInt(f[6]) || 0,
        track_genre: f[20] || '',
      });
    }

    const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

    this.songsByTitle = [...songs].sort((a, b) =>
      cmp(a.track_name.toLowerCase(), b.track_name.toLowerCase()),
    );

    this.songsByArtist = [...songs].sort((a, b) =>
      cmp(a.artists.toLowerCase(), b.artists.toLowerCase()),
    );

    this.logger.log(
      `Loaded ${songs.length} songs in ${Date.now() - t0}ms`,
    );
  }

  getSongsByTitle(): Song[] {
    return this.songsByTitle;
  }

  getSongsByArtist(): Song[] {
    return this.songsByArtist;
  }

  getTotalCount(): number {
    return this.songsByTitle.length;
  }
}
