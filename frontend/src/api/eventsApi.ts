const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type UserEventType =
  | "search"
  | "play"
  | "favorite"
  | "skip"
  | "unfavorite";

export type UserEventInput = {
  userId: string;
  type: UserEventType;
  trackId?: string;
  query?: string;
};

/** Envia o evento em modo "fire and forget" — não bloqueia a UI. */
export function postEvent(event: UserEventInput): void {
  try {
    void fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => undefined);
  } catch {
    return;
  }
}
