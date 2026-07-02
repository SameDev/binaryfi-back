import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const EVENT_TYPES = [
  'search',
  'play',
  'favorite',
  'skip',
  'unfavorite',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export class CreateEventDto {
  @ApiProperty({ example: 'user_gabriel' })
  @IsString()
  @MaxLength(128)
  userId: string;

  @ApiProperty({
    example: 'play',
    enum: EVENT_TYPES,
  })
  @IsIn(EVENT_TYPES)
  type: EventType;

  @ApiProperty({ example: '5SuOikwiRyPMVoIQDJUgSV', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  trackId?: string;

  @ApiProperty({ example: 'bohemian', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  query?: string;
}
