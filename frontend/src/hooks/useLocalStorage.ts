import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));

  useEffect(() => {
    setValue(readStorage(key, initialValue));
  }, [key]);

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) =>
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next
      );
    },
    []
  );

  return [value, update] as const;
}
