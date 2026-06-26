import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  binary(
    @Query('q') query: string,
    @Query('by') by: 'title' | 'artist' = 'title',
  ) {
    if (!query) return { error: 'Missing query param "q"' };
    const field = by === 'artist' ? 'artist' : 'title';
    return this.searchService.binarySearch(query, field);
  }

  @Get('sequential')
  sequential(
    @Query('q') query: string,
    @Query('by') by: 'title' | 'artist' = 'title',
  ) {
    if (!query) return { error: 'Missing query param "q"' };
    const field = by === 'artist' ? 'artist' : 'title';
    return this.searchService.sequentialSearch(query, field);
  }
}
