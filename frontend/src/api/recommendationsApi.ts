import type { Song } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchRecommendations(
  userId: string,
  genres: string[],
  limit = 30
): Promise<Song[]> {
  const params = new URLSearchParams({ userId, limit: String(limit) });
  if (genres.length) params.set("genres", genres.join(","));

  try {
    const response = await fetch(`${BASE_URL}/recommendations?${params}`);
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: Song[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}
