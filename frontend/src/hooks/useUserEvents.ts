import { useCallback, useMemo } from "react";
import type { Song } from "../types";
import { postEvent, type UserEventType } from "../api/eventsApi";

export function useUserEvents(userId: string | null) {
  const track = useCallback(
    (type: UserEventType, song?: Song, query?: string) => {
      if (!userId) return;
      postEvent({ userId, type, trackId: song?.track_id, query });
    },
    [userId]
  );

  return useMemo(
    () => ({
      play: (song: Song) => track("play", song),
      favorite: (song: Song) => track("favorite", song),
      unfavorite: (song: Song) => track("unfavorite", song),
      skip: (song: Song) => track("skip", song),
      search: (query: string) => track("search", undefined, query),
    }),
    [track]
  );
}
