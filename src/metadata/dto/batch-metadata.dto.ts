import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class BatchMetadataDto {
  @ApiProperty({
    example: ['5SuOikwiRyPMVoIQDJUgSV', '4gzpq5DPGxSnKTe4SA8HAU'],
    description: 'IDs das faixas (máx. 100 por requisição).',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  trackIds: string[];
}
