import { ApiProperty } from '@nestjs/swagger';

export type MetadataSource = 'spotify' | 'deezer' | 'itunes' | 'fallback';

export class TrackMetadata {
  @ApiProperty({ example: '5SuOikwiRyPMVoIQDJUgSV' })
  trackId: string;

  @ApiProperty({ example: 'Bohemian Rhapsody' })
  title: string;

  @ApiProperty({ example: 'Queen' })
  artist: string;

  @ApiProperty({ example: 'A Night at the Opera' })
  album: string;

  @ApiProperty({
    example: 'https://i.scdn.co/image/ab67616d0000b273...',
    nullable: true,
  })
  coverUrl: string | null;

  @ApiProperty({ example: 'https://cdn.deezer.com/preview.mp3', nullable: true })
  previewUrl: string | null;

  @ApiProperty({ example: 'https://open.spotify.com/track/...', nullable: true })
  externalUrl: string | null;

  @ApiProperty({
    example: 'deezer',
    enum: ['spotify', 'deezer', 'itunes', 'fallback'],
  })
  source: MetadataSource;
}
