import { useCallback, useEffect, useState } from "react";
import type { MusicGenre, Song } from "../types";
import {
  readStorage,
  storageKeys,
  writeStorage,
} from "../utils/storage";
import { uniqueSongs } from "../utils/uniqueSongs";

const RECENT_LIMIT = 20;
const DISCOVERED_LIMIT = 400;

export function useMusicLibrary(userId: string | null) {
  const [preferences, setPreferences] = useState<MusicGenre[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [discovered, setDiscovered] = useState<Song[]>([]);

  useEffect(() => {
    if (!userId) {
      setPreferences([]);
      setFavorites([]);
      setRecent([]);
      setDiscovered([]);
      return;
    }
    setPreferences(readStorage<MusicGenre[]>(storageKeys.preferences(userId), []));
    setFavorites(readStorage<Song[]>(storageKeys.favorites(userId), []));
    setRecent(readStorage<Song[]>(storageKeys.recent(userId), []));
    setDiscovered(readStorage<Song[]>(storageKeys.discovered(userId), []));
  }, [userId]);

  const savePreferences = useCallback(
    (genres: MusicGenre[]) => {
      setPreferences(genres);
      if (userId) writeStorage(storageKeys.preferences(userId), genres);
    },
    [userId]
  );

  const playSong = useCallback(
    (song: Song) => {
      setRecent((prev) => {
        const filtered = prev.filter((s) => s.track_id !== song.track_id);
        const next = [song, ...filtered].slice(0, RECENT_LIMIT);
        if (userId) writeStorage(storageKeys.recent(userId), next);
        return next;
      });
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    (song: Song) => {
      setFavorites((prev) => {
        const exists = prev.some((s) => s.track_id === song.track_id);
        const next = exists
          ? prev.filter((s) => s.track_id !== song.track_id)
          : [song, ...prev];
        if (userId) writeStorage(storageKeys.favorites(userId), next);
        return next;
      });
    },
    [userId]
  );

  const isFavorite = useCallback(
    (trackId: string) => favorites.some((s) => s.track_id === trackId),
    [favorites]
  );

  const addDiscovered = useCallback(
    (songs: Song[]) => {
      if (!songs.length) return;
      setDiscovered((prev) => {
        const next = uniqueSongs([...songs, ...prev]).slice(0, DISCOVERED_LIMIT);
        if (userId) writeStorage(storageKeys.discovered(userId), next);
        return next;
      });
    },
    [userId]
  );

  return {
    preferences,
    favorites,
    recent,
    discovered,
    savePreferences,
    playSong,
    toggleFavorite,
    isFavorite,
    addDiscovered,
  };
}
