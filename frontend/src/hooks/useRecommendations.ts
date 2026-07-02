import { useCallback, useEffect, useRef, useState } from "react";
import type { Song } from "../types";
import { fetchRecommendations } from "../api/recommendationsApi";

const REFRESH_DEBOUNCE = 1500;

export function useRecommendations(
  userId: string | null,
  genres: string[],
  limit = 30
) {
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const genresKey = genres.join(",");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setRecommendations([]);
      return;
    }
    setLoading(true);
    const list = genresKey ? genresKey.split(",") : [];
    const songs = await fetchRecommendations(userId, list, limit);
    setRecommendations(songs);
    setLoading(false);
  }, [userId, genresKey, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void load();
    }, REFRESH_DEBOUNCE);
  }, [load]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { recommendations, loading, refresh };
}
