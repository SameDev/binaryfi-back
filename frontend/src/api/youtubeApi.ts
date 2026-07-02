import type { Song } from "../types";

function primaryArtist(song: Song): string {
  return song.artists.split(";")[0].trim();
}

function buildQuery(song: Song): string {
  const parts = [primaryArtist(song), song.track_name];
  if (song.album_name && song.album_name !== song.track_name) {
    parts.push(song.album_name);
  }
  return parts.filter(Boolean).join(" ");
}

export function getYouTubeSearchUrl(song: Song): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    buildQuery(song)
  )}`;
}
