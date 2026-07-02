export type Song = {
  track_id: string;
  artists: string;
  album_name: string;
  track_name: string;
  popularity: number;
  duration_ms: number;
  track_genre: string;
};

export type SearchBy = "title" | "artist";

export type SearchAction =
  | "go_left"
  | "go_right"
  | "found_continue_left"
  | "not_found";

export type SearchStats = {
  comparisons: number;
  totalSongs: number;
  timeMs: number;
};

export type SearchStep = {
  step: number;
  low: number;
  high: number;
  mid: number;
  comparing: string;
  action: SearchAction;
};

export type SearchResponse = {
  query: string;
  by: SearchBy;
  algorithm: "binary" | "sequential";
  found: boolean;
  results: Song[];
  stats: SearchStats;
  steps: SearchStep[];
  error?: string;
};

export type MusicGenre =
  | "pop"
  | "rock"
  | "rap"
  | "hip-hop"
  | "funk"
  | "sertanejo"
  | "pagode"
  | "samba"
  | "electronic"
  | "latin"
  | "gospel"
  | "k-pop"
  | "jazz"
  | "blues"
  | "country"
  | "classical";

export type User = {
  id: string;
  name: string;
  email: string;
  // Nunca guardamos a senha pura: apenas o hash e o salt.
  passwordHash?: string;
  salt?: string;
  // Campo legado: contas criadas antes do hash. Migrado no primeiro login.
  password?: string;
};

export type MetadataSource = "spotify" | "deezer" | "itunes" | "fallback";

export type TrackMetadata = {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string | null;
  previewUrl: string | null;
  externalUrl: string | null;
  source: MetadataSource;
};

export type PlayerTrack = {
  song: Song;
  metadata: TrackMetadata;
};

export type YouTubeVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl?: string;
  url: string;
};
