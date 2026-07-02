import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Recomendações personalizadas',
    description:
      'Recomenda faixas a partir dos gêneros preferidos e das interações (play/favorite/skip/search). ' +
      'Mistura afinidade de gênero, similaridade de atributos musicais, artista, popularidade e exploração.',
  })
  @ApiQuery({ name: 'userId', required: true, example: 'user_gabriel' })
  @ApiQuery({ name: 'limit', required: false, example: 30 })
  @ApiQuery({
    name: 'genres',
    required: false,
    example: 'pop,rock',
    description:
      'Gêneros preferidos escolhidos pelo usuário (separados por vírgula).',
  })
  get(
    @Query('userId') userId = '',
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Query('genres') genres = '',
  ) {
    const preferred = genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const results = this.recommendations.recommend(
      userId,
      safeLimit,
      preferred,
    );
    return { userId, count: results.length, results };
  }
}
