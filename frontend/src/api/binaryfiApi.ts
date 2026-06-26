import type { SearchBy, SearchResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiConnectionError extends Error {
  constructor() {
    super("connection");
    this.name = "ApiConnectionError";
  }
}

export async function searchSongs(
  query: string,
  by: SearchBy
): Promise<SearchResponse> {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&by=${by}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiConnectionError();
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SearchResponse;
  return data;
}
