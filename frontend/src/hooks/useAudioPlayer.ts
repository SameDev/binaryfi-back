import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerTrack, Song } from "../types";
import { getTrackMetadata } from "../api/metadataApi";

export type PlayerStatus = "idle" | "loading" | "ready" | "unavailable";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestId = useRef(0);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(async (song: Song) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setStatus("loading");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrent({ song, metadata: { source: "none" } });

    const metadata = await getTrackMetadata(song);
    if (requestId.current !== id) return;
    setCurrent({ song, metadata });

    const audio = audioRef.current;
    if (metadata.previewUrl && audio) {
      audio.src = metadata.previewUrl;
      try {
        await audio.play();
        setStatus("ready");
      } catch {
        setStatus("unavailable");
      }
    } else {
      audio?.pause();
      setStatus("unavailable");
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || status !== "ready") return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }, [status]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (audio && status === "ready") {
        audio.currentTime = time;
        setCurrentTime(time);
      }
    },
    [status]
  );

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    requestId.current += 1;
    setCurrent(null);
    setStatus("idle");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    current,
    status,
    isPlaying,
    currentTime,
    duration,
    play,
    toggle,
    seek,
    close,
  };
}
