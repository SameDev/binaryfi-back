import { useCallback, useState } from "react";
import type { User } from "../types";
import {
  readStorage,
  removeStorage,
  storageKeys,
  writeStorage,
} from "../utils/storage";

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

function makeId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

export function useAuth() {
  const [users, setUsers] = useState<User[]>(() =>
    readStorage<User[]>(storageKeys.users, [])
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    readStorage<User | null>(storageKeys.currentUser, null)
  );

  const persistUsers = useCallback((next: User[]) => {
    setUsers(next);
    writeStorage(storageKeys.users, next);
  }, []);

  const persistCurrent = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) writeStorage(storageKeys.currentUser, user);
    else removeStorage(storageKeys.currentUser);
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string): AuthResult => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || !cleanEmail || !password) {
        return { ok: false, error: "Preencha todos os campos." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: "Informe um email válido." };
      }
      if (password.length < 4) {
        return { ok: false, error: "A senha deve ter ao menos 4 caracteres." };
      }
      if (users.some((u) => u.email === cleanEmail)) {
        return { ok: false, error: "Este email já está cadastrado." };
      }
      const user: User = {
        id: makeId(cleanEmail),
        name: cleanName,
        email: cleanEmail,
        password,
      };
      persistUsers([...users, user]);
      persistCurrent(user);
      return { ok: true, user };
    },
    [users, persistUsers, persistCurrent]
  );

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { ok: false, error: "Preencha email e senha." };
      }
      const found = users.find((u) => u.email === cleanEmail);
      if (!found || found.password !== password) {
        return { ok: false, error: "Email ou senha incorretos." };
      }
      persistCurrent(found);
      return { ok: true, user: found };
    },
    [users, persistCurrent]
  );

  const logout = useCallback(() => {
    persistCurrent(null);
  }, [persistCurrent]);

  return { users, currentUser, register, login, logout };
}
