import type { Song, YouTubeVideo } from "../types";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const SEARCH_API = "https://www.googleapis.com/youtube/v3/search";

export const youtubeApiEnabled = Boolean(API_KEY);

type YouTubeApiItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

function buildQuery(song: Song): string {
  return `${song.artists} ${song.track_name} official audio`;
}

function primaryArtist(song: Song): string {
  return song.artists.split(";")[0].trim().toLowerCase();
}

function scoreResult(item: YouTubeApiItem, song: Song): number {
  const title = (item.snippet?.title ?? "").toLowerCase();
  const channel = (item.snippet?.channelTitle ?? "").toLowerCase();
  const track = song.track_name.toLowerCase();
  const artist = primaryArtist(song);

  let score = 0;

  if (title.includes(track)) {
    score += 5;
  } else {
    for (const word of track.split(/\s+/)) {
      if (word.length > 2 && title.includes(word)) score += 1;
    }
  }

  if (title.includes(artist) || channel.includes(artist)) score += 4;
  if (channel.includes("vevo") || channel.includes("official") || channel.includes("topic")) {
    score += 3;
  }
  if (title.includes("official audio")) score += 2;
  else if (title.includes("official")) score += 1;
  if (title.includes("cover") || title.includes("live") || title.includes("reaction") || title.includes("remix")) {
    score -= 3;
  }

  return score;
}

export function getYouTubeSearchUrl(song: Song): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(buildQuery(song))}`;
}

export async function searchYouTubeVideo(song: Song): Promise<YouTubeVideo | null> {
  if (!API_KEY) return null;

  const url =
    `${SEARCH_API}?part=snippet&type=video&maxResults=5` +
    `&q=${encodeURIComponent(buildQuery(song))}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as { items?: YouTubeApiItem[] };
    const candidates = (data.items ?? []).filter((item) => item.id?.videoId);
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => scoreResult(b, song) - scoreResult(a, song));
    const best = candidates[0];
    const videoId = best.id!.videoId!;

    return {
      videoId,
      title: best.snippet?.title ?? song.track_name,
      channelTitle: best.snippet?.channelTitle ?? "",
      thumbnailUrl: best.snippet?.thumbnails?.medium?.url ?? best.snippet?.thumbnails?.default?.url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return null;
  }
}
