import { useCallback, useState } from "react";
import type { User } from "../types";
import {
  readStorage,
  removeStorage,
  storageKeys,
  writeStorage,
} from "../utils/storage";
import { hashPassword, makeSalt } from "../utils/password";

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

function makeId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// Remove a senha pura antes de persistir (defesa extra p/ contas legadas).
function sanitize(user: User): User {
  const { password, ...safe } = user;
  void password;
  return safe;
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
    if (user) writeStorage(storageKeys.currentUser, sanitize(user));
    else removeStorage(storageKeys.currentUser);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<AuthResult> => {
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

      const salt = makeSalt();
      const passwordHash = await hashPassword(password, salt);
      const user: User = {
        id: makeId(cleanEmail),
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        salt,
      };
      persistUsers([...users, sanitize(user)]);
      persistCurrent(user);
      return { ok: true, user };
    },
    [users, persistUsers, persistCurrent]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { ok: false, error: "Preencha email e senha." };
      }
      const found = users.find((u) => u.email === cleanEmail);
      if (!found) {
        return { ok: false, error: "Email ou senha incorretos." };
      }

      let authenticated: User | null = null;

      if (found.passwordHash && found.salt) {
        const hash = await hashPassword(password, found.salt);
        if (hash === found.passwordHash) authenticated = found;
      } else if (found.password !== undefined) {
        // Conta legada (senha pura): valida e migra para hash + salt.
        if (found.password === password) {
          const salt = makeSalt();
          const passwordHash = await hashPassword(password, salt);
          const upgraded: User = {
            id: found.id,
            name: found.name,
            email: found.email,
            passwordHash,
            salt,
          };
          persistUsers(
            users.map((u) => (u.email === cleanEmail ? upgraded : u))
          );
          authenticated = upgraded;
        }
      }

      if (!authenticated) {
        return { ok: false, error: "Email ou senha incorretos." };
      }

      persistCurrent(authenticated);
      return { ok: true, user: authenticated };
    },
    [users, persistUsers, persistCurrent]
  );

  const logout = useCallback(() => {
    persistCurrent(null);
  }, [persistCurrent]);

  return { users, currentUser, register, login, logout };
}
