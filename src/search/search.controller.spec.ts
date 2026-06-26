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
  stats: { comparisons: 17, totalSongs: 114000, timeMs: 0.1 },
  steps: [],
};

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const mockSearchService = {
      binarySearch: jest.fn().mockReturnValue(mockResult),
      sequentialSearch: jest.fn().mockReturnValue({ ...mockResult, algorithm: 'sequential' }),
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
      controller.binary('bohemian', 'title');
      expect(searchService.binarySearch).toHaveBeenCalledWith('bohemian', 'title');
    });

    it('defaults by to title when not provided', () => {
      controller.binary('test', undefined as any);
      expect(searchService.binarySearch).toHaveBeenCalledWith('test', 'title');
    });

    it('returns error when query is missing', () => {
      const result = controller.binary(undefined as any, 'title');
      expect(result).toEqual({ error: 'Missing query param "q"' });
      expect(searchService.binarySearch).not.toHaveBeenCalled();
    });

    it('passes artist field correctly', () => {
      controller.binary('queen', 'artist');
      expect(searchService.binarySearch).toHaveBeenCalledWith('queen', 'artist');
    });
  });

  describe('GET /search/sequential', () => {
    it('calls sequentialSearch with correct args', () => {
      controller.sequential('bohemian', 'title');
      expect(searchService.sequentialSearch).toHaveBeenCalledWith('bohemian', 'title');
    });

    it('returns error when query is missing', () => {
      const result = controller.sequential(undefined as any, 'title');
      expect(result).toEqual({ error: 'Missing query param "q"' });
      expect(searchService.sequentialSearch).not.toHaveBeenCalled();
    });
  });
});
