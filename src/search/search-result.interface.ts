import { Song } from '../songs/song.interface';

export type SearchAction =
  | 'go_left'
  | 'go_right'
  | 'found_continue_left'
  | 'not_found';

export interface SearchStep {
  step: number;
  low: number;
  high: number;
  mid: number;
  comparing: string;
  action: SearchAction;
}

export interface SearchStats {
  comparisons: number;
  totalSongs: number;
  timeMs: number;
}

export interface SearchResult {
  query: string;
  by: 'title' | 'artist';
  algorithm: 'binary' | 'sequential';
  found: boolean;
  results: Song[];
  stats: SearchStats;
  steps: SearchStep[];
}
