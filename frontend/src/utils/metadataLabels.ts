import type { MetadataSource } from "../types";

const LABELS: Record<MetadataSource, string | null> = {
  spotify: "Abrir no Spotify",
  deezer: "Abrir no Deezer",
  itunes: "Abrir no iTunes",
  fallback: null,
};

export function externalLinkLabel(source: MetadataSource): string {
  return LABELS[source] ?? "Abrir link externo";
}

export function externalLinkLabelOrNull(source: MetadataSource): string | null {
  return LABELS[source];
}
