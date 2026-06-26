import { useState } from "react";
import type { User } from "../types";

type Mode = "register" | "login";

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

type Props = {
  onRegister: (name: string, email: string, password: string) => AuthResult;
  onLogin: (email: string, password: string) => AuthResult;
};

export function AuthScreen({ onRegister, onLogin }: Props) {
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const result =
      mode === "register"
        ? onRegister(name, email, password)
        : onLogin(email, password);
    if (!result.ok) setError(result.error);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
  };

  return (
    <div className="auth-screen">
      <div className="auth-aside">
        <div className="brand brand--large">
          <img className="brand-logo" src="/logo.png" alt="BinaryFi" />
          <span>BinaryFi</span>
        </div>
        <h1>Sua música encontrada na velocidade do log n.</h1>
        <p>
          Busca binária real sobre 114 mil músicas do Spotify. Crie sua conta e
          comece a explorar.
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("register")}
          >
            Criar conta
          </button>
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="field">
              <span>Nome</span>
              <input
                type="text"
                value={name}
                placeholder="Seu nome"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              placeholder="voce@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block">
            {mode === "register" ? "Criar minha conta" : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "register" ? (
            <>
              Já tem conta?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Entrar
              </button>
            </>
          ) : (
            <>
              Ainda não tem conta?{" "}
              <button type="button" onClick={() => switchMode("register")}>
                Criar agora
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
