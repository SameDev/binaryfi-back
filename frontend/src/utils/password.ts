/**
 * Hash de senha no cliente com SHA-256 + salt aleatório.
 *
 * Isto evita guardar a senha pura no localStorage. NÃO substitui uma
 * autenticação real: o próximo passo (documentado no README) é mover o
 * cadastro/login para o backend com Argon2 + JWT.
 */

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function makeSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}
