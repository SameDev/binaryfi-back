export const storageKeys = {
  users: "binaryfi_users",
  currentUser: "binaryfi_current_user",
  preferences: (userId: string) => `binaryfi_preferences_${userId}`,
  favorites: (userId: string) => `binaryfi_favorites_${userId}`,
  recent: (userId: string) => `binaryfi_recent_${userId}`,
  discovered: (userId: string) => `binaryfi_discovered_${userId}`,
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}
