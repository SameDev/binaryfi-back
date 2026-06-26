import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { SongsService } from '../songs/songs.service';
import { Song } from '../songs/song.interface';

const makeSong = (track_name: string, artists: string): Song => ({
  track_id: 'id',
  track_name,
  artists,
  album_name: 'Album',
  popularity: 50,
  duration_ms: 200000,
  track_genre: 'pop',
});

// 8 songs sorted by title (lowercase order)
const BY_TITLE: Song[] = [
  makeSong('Bohemian Rhapsody', 'Queen'),
  makeSong('Dusk Till Dawn', 'ZAYN'),
  makeSong('Easy On Me', 'Adele'),
  makeSong('Numb', 'Linkin Park'),
  makeSong('Perfect', 'Ed Sheeran'),
  makeSong('Rolling in the Deep', 'Adele'),
  makeSong('Shape of You', 'Ed Sheeran'),
  makeSong('Waterloo', 'ABBA'),
];

// 8 songs sorted by artist (lowercase order)
const BY_ARTIST: Song[] = [
  makeSong('Waterloo', 'ABBA'),
  makeSong('Rolling in the Deep', 'Adele'),
  makeSong('Easy On Me', 'Adele'),
  makeSong('Perfect', 'Ed Sheeran'),
  makeSong('Shape of You', 'Ed Sheeran'),
  makeSong('Numb', 'Linkin Park'),
  makeSong('Bohemian Rhapsody', 'Queen'),
  makeSong('Pillowtalk', 'ZAYN'),
];

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const mockSongsService = {
      getSongsByTitle: () => BY_TITLE,
      getSongsByArtist: () => BY_ARTIST,
      getTotalCount: () => BY_TITLE.length,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: SongsService, useValue: mockSongsService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  describe('binarySearch', () => {
    it('finds song by exact title prefix', () => {
      const result = service.binarySearch('shape', 'title');
      expect(result.found).toBe(true);
      expect(result.results[0].track_name).toBe('Shape of You');
      expect(result.algorithm).toBe('binary');
    });

    it('finds multiple songs with same artist prefix', () => {
      const result = service.binarySearch('adele', 'artist');
      expect(result.found).toBe(true);
      expect(result.results.length).toBe(2);
      expect(result.results.every((s) => s.artists === 'Adele')).toBe(true);
    });

    it('returns found=false for non-existent query', () => {
      const result = service.binarySearch('zzzzz', 'title');
      expect(result.found).toBe(false);
      expect(result.results).toHaveLength(0);
    });

    it('returns steps array with correct shape', () => {
      const result = service.binarySearch('perfect', 'title');
      expect(result.steps.length).toBeGreaterThan(0);
      const step = result.steps[0];
      expect(step).toHaveProperty('step');
      expect(step).toHaveProperty('low');
      expect(step).toHaveProperty('high');
      expect(step).toHaveProperty('mid');
      expect(step).toHaveProperty('comparing');
      expect(step).toHaveProperty('action');
    });

    it('last step action is found_continue_left when match exists', () => {
      const result = service.binarySearch('bohemian', 'title');
      expect(result.found).toBe(true);
      const foundSteps = result.steps.filter(
        (s) => s.action === 'found_continue_left',
      );
      expect(foundSteps.length).toBeGreaterThan(0);
    });

    it('uses far fewer comparisons than total songs', () => {
      const result = service.binarySearch('waterloo', 'title');
      expect(result.stats.comparisons).toBeLessThan(BY_TITLE.length);
    });

    it('reports correct totalSongs in stats', () => {
      const result = service.binarySearch('numb', 'title');
      expect(result.stats.totalSongs).toBe(BY_TITLE.length);
    });

    it('case-insensitive prefix match', () => {
      const lower = service.binarySearch('shape of you', 'title');
      const upper = service.binarySearch('SHAPE OF YOU', 'title');
      expect(lower.found).toBe(true);
      expect(upper.found).toBe(true);
      expect(lower.results[0].track_name).toBe(upper.results[0].track_name);
    });
  });

  describe('sequentialSearch', () => {
    it('finds same results as binary search', () => {
      const binary = service.binarySearch('adele', 'artist');
      const seq = service.sequentialSearch('adele', 'artist');
      expect(seq.found).toBe(binary.found);
      const bNames = binary.results.map((s) => s.track_name).sort();
      const sNames = seq.results.map((s) => s.track_name).sort();
      expect(sNames).toEqual(bNames);
    });

    it('comparisons equals total songs (scans all)', () => {
      const result = service.sequentialSearch('adele', 'artist');
      expect(result.stats.comparisons).toBe(BY_ARTIST.length);
    });

    it('returns empty steps array', () => {
      const result = service.sequentialSearch('adele', 'artist');
      expect(result.steps).toHaveLength(0);
    });

    it('algorithm field is sequential', () => {
      const result = service.sequentialSearch('numb', 'title');
      expect(result.algorithm).toBe('sequential');
    });
  });

  describe('binary vs sequential comparison', () => {
    it('binary uses fewer comparisons than sequential', () => {
      const binary = service.binarySearch('shape', 'title');
      const seq = service.sequentialSearch('shape', 'title');
      expect(binary.stats.comparisons).toBeLessThan(seq.stats.comparisons);
    });
  });
});
