import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SongsService } from './songs.service';

@ApiTags('songs')
@Controller()
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('genres')
  @ApiOperation({
    summary: 'Lista de gêneros',
    description:
      'Retorna todos os gêneros do dataset com a contagem de faixas de cada um.',
  })
  getGenres() {
    return {
      total: this.songsService.getGenres().length,
      genres: this.songsService.getGenres(),
    };
  }
}
