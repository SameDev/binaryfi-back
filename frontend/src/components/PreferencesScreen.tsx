import { useState } from "react";
import type { MusicGenre } from "../types";

const GENRES: MusicGenre[] = [
  "pop",
  "rock",
  "rap",
  "hip-hop",
  "funk",
  "sertanejo",
  "pagode",
  "samba",
  "electronic",
  "latin",
  "gospel",
  "k-pop",
  "jazz",
  "blues",
  "country",
  "classical",
];

type Props = {
  userName: string;
  initial: MusicGenre[];
  onConfirm: (genres: MusicGenre[]) => void;
};

export function PreferencesScreen({ userName, initial, onConfirm }: Props) {
  const [selected, setSelected] = useState<MusicGenre[]>(initial);

  const toggle = (genre: MusicGenre) => {
    setSelected((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="preferences-screen">
      <div className="preferences-card">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <span>BinaryFi</span>
        </div>
        <h1>Quais estilos de música você mais gosta, {userName}?</h1>
        <p className="preferences-subtitle">
          Escolha um ou mais gêneros para personalizar suas recomendações.
        </p>

        <div className="genre-grid">
          {GENRES.map((genre) => {
            const active = selected.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                className={active ? "genre-chip active" : "genre-chip"}
                onClick={() => toggle(genre)}
              >
                {genre}
              </button>
            );
          })}
        </div>

        <div className="preferences-actions">
          <span className="preferences-count">
            {selected.length} selecionado{selected.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={selected.length === 0}
            onClick={() => onConfirm(selected)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
