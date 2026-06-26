import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchResult } from './search-result.interface';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Busca binária',
    description:
      'Busca músicas por prefixo usando busca binária (O log n). ' +
      'Retorna resultados + steps detalhados do algoritmo para visualização.',
  })
  @ApiQuery({ name: 'q', example: 'bohemian', description: 'Prefixo de busca' })
  @ApiQuery({
    name: 'by',
    enum: ['title', 'artist'],
    required: false,
    description: 'Campo de busca (padrão: title)',
  })
  @ApiResponse({ status: 200, type: SearchResult })
  binary(
    @Query('q') query: string,
    @Query('by') by: 'title' | 'artist' = 'title',
  ) {
    if (!query) return { error: 'Missing query param "q"' };
    const field = by === 'artist' ? 'artist' : 'title';
    return this.searchService.binarySearch(query, field);
  }

  @Get('sequential')
  @ApiOperation({
    summary: 'Busca sequencial',
    description:
      'Busca músicas percorrendo todos os elementos (O n). ' +
      'Use para comparar performance com a busca binária.',
  })
  @ApiQuery({ name: 'q', example: 'bohemian', description: 'Prefixo de busca' })
  @ApiQuery({
    name: 'by',
    enum: ['title', 'artist'],
    required: false,
    description: 'Campo de busca (padrão: title)',
  })
  @ApiResponse({ status: 200, type: SearchResult })
  sequential(
    @Query('q') query: string,
    @Query('by') by: 'title' | 'artist' = 'title',
  ) {
    if (!query) return { error: 'Missing query param "q"' };
    const field = by === 'artist' ? 'artist' : 'title';
    return this.searchService.sequentialSearch(query, field);
  }
}
