import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { TrackMetadata } from './track-metadata.interface';
import { BatchMetadataDto } from './dto/batch-metadata.dto';

@ApiTags('metadata')
@Controller('tracks')
export class MetadataController {
  constructor(private readonly metadata: MetadataService) {}

  @Get(':trackId/metadata')
  @ApiOperation({
    summary: 'Metadata de uma faixa',
    description:
      'Busca capa, preview e link externo com fallback Spotify → Deezer → iTunes → placeholder.',
  })
  @ApiResponse({ status: 200, type: TrackMetadata })
  getOne(@Param('trackId') trackId: string): Promise<TrackMetadata> {
    return this.metadata.getOne(trackId);
  }

  @Post('metadata/batch')
  @ApiOperation({
    summary: 'Metadata em lote',
    description:
      'Resolve metadados de várias faixas de uma vez, reaproveitando o cache do servidor.',
  })
  @ApiResponse({ status: 200, type: [TrackMetadata] })
  getBatch(@Body() dto: BatchMetadataDto): Promise<TrackMetadata[]> {
    return this.metadata.getMany(dto.trackIds);
  }
}
