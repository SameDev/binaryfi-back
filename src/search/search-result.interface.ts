import { ApiProperty } from '@nestjs/swagger';
import { Song } from '../songs/song.interface';

export type SearchAction =
  | 'go_left'
  | 'go_right'
  | 'found_continue_left'
  | 'not_found';

export class SearchStep {
  @ApiProperty({ example: 1 })
  step: number;

  @ApiProperty({ example: 0 })
  low: number;

  @ApiProperty({ example: 56999 })
  high: number;

  @ApiProperty({ example: 56999 })
  mid: number;

  @ApiProperty({ example: 'Lucky' })
  comparing: string;

  @ApiProperty({
    example: 'go_left',
    enum: ['go_left', 'go_right', 'found_continue_left', 'not_found'],
  })
  action: SearchAction;
}

export class SearchStats {
  @ApiProperty({ example: 17 })
  comparisons: number;

  @ApiProperty({ example: 114000 })
  totalSongs: number;

  @ApiProperty({ example: 0.148 })
  timeMs: number;
}

export class SearchResult {
  @ApiProperty({ example: 'bohemian' })
  query: string;

  @ApiProperty({ example: 'title', enum: ['title', 'artist'] })
  by: 'title' | 'artist';

  @ApiProperty({ example: 'binary', enum: ['binary', 'sequential'] })
  algorithm: 'binary' | 'sequential';

  @ApiProperty({ example: true })
  found: boolean;

  @ApiProperty({ type: [Song] })
  results: Song[];

  @ApiProperty({ type: SearchStats })
  stats: SearchStats;

  @ApiProperty({ type: [SearchStep] })
  steps: SearchStep[];
}
