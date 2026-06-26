import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { SongsService } from '../songs/songs.service';
import { Song } from '../songs/song.interface';
import { SearchResult, SearchStep } from './search-result.interface';

@Injectable()
export class SearchService {
  constructor(private readonly songsService: SongsService) {}

  private getArr(by: 'title' | 'artist'): Song[] {
    return by === 'title'
      ? this.songsService.getSongsByTitle()
      : this.songsService.getSongsByArtist();
  }

  private getField(song: Song, by: 'title' | 'artist'): string {
    return by === 'title' ? song.track_name : song.artists;
  }

  binarySearch(query: string, by: 'title' | 'artist'): SearchResult {
    const t0 = performance.now();
    const arr = this.getArr(by);
    const q = query.toLowerCase();
    const steps: SearchStep[] = [];
    let comparisons = 0;

    // Find lower bound: first index where field >= query
    let low = 0;
    let high = arr.length - 1;
    let lowerBound = arr.length;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const field = this.getField(arr[mid], by).toLowerCase();
      comparisons++;

      if (field >= q) {
        lowerBound = mid;
        high = mid - 1;
        steps.push({
          step: steps.length + 1,
          low: high + 1,
          high: mid - 1,
          mid,
          comparing: this.getField(arr[mid], by),
          action: field.startsWith(q) ? 'found_continue_left' : 'go_left',
        });
      } else {
        low = mid + 1;
        steps.push({
          step: steps.length + 1,
          low: mid + 1,
          high,
          mid,
          comparing: this.getField(arr[mid], by),
          action: 'go_right',
        });
      }
    }

    // Collect all prefix matches starting from lowerBound
    const results: Song[] = [];
    let i = lowerBound;
    while (
      i < arr.length &&
      this.getField(arr[i], by).toLowerCase().startsWith(q)
    ) {
      results.push(arr[i]);
      i++;
    }

    return {
      query,
      by,
      algorithm: 'binary',
      found: results.length > 0,
      results: results.slice(0, 50),
      stats: {
        comparisons,
        totalSongs: arr.length,
        timeMs: parseFloat((performance.now() - t0).toFixed(3)),
      },
      steps,
    };
  }

  sequentialSearch(query: string, by: 'title' | 'artist'): SearchResult {
    const t0 = performance.now();
    const arr = this.getArr(by);
    const q = query.toLowerCase();
    const results: Song[] = [];
    let comparisons = 0;

    for (const song of arr) {
      comparisons++;
      if (this.getField(song, by).toLowerCase().startsWith(q)) {
        results.push(song);
      }
    }

    return {
      query,
      by,
      algorithm: 'sequential',
      found: results.length > 0,
      results: results.slice(0, 50),
      stats: {
        comparisons,
        totalSongs: arr.length,
        timeMs: parseFloat((performance.now() - t0).toFixed(3)),
      },
      steps: [],
    };
  }
}
