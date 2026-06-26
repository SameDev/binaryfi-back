import type { Song } from "../types";

export function uniqueSongs(songs: Song[]): Song[] {
  const seen = new Set<string>();
  const result: Song[] = [];
  for (const song of songs) {
    if (!song || !song.track_id) continue;
    if (seen.has(song.track_id)) continue;
    seen.add(song.track_id);
    result.push(song);
  }
  return result;
}

export function mergeUniqueSongs(...lists: Song[][]): Song[] {
  return uniqueSongs(lists.flat());
}
