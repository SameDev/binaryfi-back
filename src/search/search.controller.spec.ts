import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchResult } from './search-result.interface';

const mockResult: SearchResult = {
  query: 'test',
  by: 'title',
  algorithm: 'binary',
  found: true,
  results: [],
  total: 0,
  stats: { comparisons: 17, totalSongs: 114000, timeMs: 0.1 },
  steps: [],
};

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const mockSearchService = {
      binarySearch: jest.fn().mockReturnValue(mockResult),
      sequentialSearch: jest
        .fn()
        .mockReturnValue({ ...mockResult, algorithm: 'sequential' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get(SearchService);
  });

  describe('GET /search (binary)', () => {
    it('calls binarySearch with correct args', () => {
      controller.binary('bohemian', 'title', 1, 50);
      expect(searchService.binarySearch).toHaveBeenCalledWith(
        'bohemian',
        'title',
        1,
        50,
      );
    });

    it('defaults by to title when not provided', () => {
      controller.binary('test', undefined, 1, 50);
      expect(searchService.binarySearch).toHaveBeenCalledWith(
        'test',
        'title',
        1,
        50,
      );
    });

    it('returns error when query is missing', () => {
      const result = controller.binary(undefined as any, 'title', 1, 50);
      expect(result).toEqual({ error: 'Missing query param "q"' });
      expect(searchService.binarySearch).not.toHaveBeenCalled();
    });

    it('passes artist field correctly', () => {
      controller.binary('queen', 'artist', 1, 50);
      expect(searchService.binarySearch).toHaveBeenCalledWith(
        'queen',
        'artist',
        1,
        50,
      );
    });
  });

  describe('GET /search/sequential', () => {
    it('calls sequentialSearch with correct args', () => {
      controller.sequential('bohemian', 'title', 1, 50);
      expect(searchService.sequentialSearch).toHaveBeenCalledWith(
        'bohemian',
        'title',
        1,
        50,
      );
    });

    it('returns error when query is missing', () => {
      const result = controller.sequential(undefined as any, 'title', 1, 50);
      expect(result).toEqual({ error: 'Missing query param "q"' });
      expect(searchService.sequentialSearch).not.toHaveBeenCalled();
    });
  });
});
