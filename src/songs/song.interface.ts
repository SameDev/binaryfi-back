import { ApiProperty } from '@nestjs/swagger';

export class Song {
  @ApiProperty({ example: '5SuOikwiRyPMVoIQDJUgSV' })
  track_id: string;

  @ApiProperty({ example: 'Queen' })
  artists: string;

  @ApiProperty({ example: 'A Night at the Opera' })
  album_name: string;

  @ApiProperty({ example: 'Bohemian Rhapsody' })
  track_name: string;

  @ApiProperty({ example: 87 })
  popularity: number;

  @ApiProperty({ example: 354000 })
  duration_ms: number;

  @ApiProperty({ example: 'rock' })
  track_genre: string;
}
