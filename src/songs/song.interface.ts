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

  // Atributos musicais (0..1, exceto tempo) usados nas recomendações.
  @ApiProperty({ example: 0.676 })
  danceability: number;

  @ApiProperty({ example: 0.461 })
  energy: number;

  @ApiProperty({ example: 0.0322 })
  acousticness: number;

  @ApiProperty({ example: 0.0000101 })
  instrumentalness: number;

  @ApiProperty({ example: 0.715 })
  valence: number;

  @ApiProperty({ example: 87.917 })
  tempo: number;

  @ApiProperty({ example: false })
  explicit: boolean;
}

// Vetor de atributos musicais normalizados para cálculo de similaridade.
export type AudioFeatures = Pick<
  Song,
  | 'danceability'
  | 'energy'
  | 'acousticness'
  | 'instrumentalness'
  | 'valence'
  | 'tempo'
>;
