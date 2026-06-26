# BinaryFi — Back-end

API de busca de músicas que demonstra **Busca Binária (O log n)** vs **Busca Sequencial (O n)** sobre um dataset de **114.000 músicas reais do Spotify**.

Trabalho AV3 — Estrutura de Dados.

---

## Stack

- **NestJS** + TypeScript
- Dataset em memória (CSV carregado na inicialização)
- Dois arrays ordenados: por título e por artista
- Sem banco de dados

---

## Começar

```bash
npm install
npm run start:dev
```

Servidor sobe em `http://localhost:3000`.

---

## Swagger (documentação interativa)

```
http://localhost:3000/docs
```

O colega de front pode testar todos os endpoints diretamente pelo browser.

---

## Endpoints

### `GET /search`

Busca binária por prefixo — **O(log n)**, ~17 comparações em 114K músicas.

| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `q` | string | sim | Prefixo de busca (ex: `bohemian`) |
| `by` | `title` \| `artist` | não | Campo de busca (padrão: `title`) |

```
GET /search?q=bohemian&by=title
GET /search?q=queen&by=artist
```

### `GET /search/sequential`

Busca sequencial — **O(n)**, percorre todos os 114K elementos.
Use para comparar a diferença de performance com a busca binária.

```
GET /search/sequential?q=bohemian&by=title
```

---

## Response

```json
{
  "query": "bohemian",
  "by": "title",
  "algorithm": "binary",
  "found": true,
  "results": [
    {
      "track_id": "...",
      "track_name": "Bohemian Rhapsody - Remastered 2011",
      "artists": "Queen",
      "album_name": "A Night at the Opera",
      "popularity": 87,
      "duration_ms": 354320,
      "track_genre": "rock"
    }
  ],
  "stats": {
    "comparisons": 17,
    "totalSongs": 114000,
    "timeMs": 0.148
  },
  "steps": [
    {
      "step": 1,
      "low": 0,
      "high": 56998,
      "mid": 56999,
      "comparing": "Lucky",
      "action": "go_left"
    }
  ]
}
```

### Campos de `stats`

| Campo | Descrição |
|---|---|
| `comparisons` | Total de comparações realizadas |
| `totalSongs` | Total de músicas no dataset |
| `timeMs` | Tempo de execução em milissegundos |

### Valores de `action` nos steps

| Valor | Significado |
|---|---|
| `go_right` | `arr[mid] < query` → busca na metade direita |
| `go_left` | `arr[mid] > query` → busca na metade esquerda |
| `found_continue_left` | `arr[mid]` começa com query → match, continua à esquerda para achar o menor índice |

---

## Comparação de performance (exemplo real)

| Algoritmo | Comparações | Tempo |
|---|---|---|
| Busca Binária | **17** | ~0.1ms |
| Busca Sequencial | **114.000** | ~32ms |

---

## Testes

```bash
npm test          # unit tests
npm run test:cov  # com cobertura
```

19 testes cobrindo:
- Busca binária por título e artista
- Prefix case-insensitive
- Not found
- Shape dos steps
- Comparações: binária < sequencial
- Controller: missing query, defaults

---

## Estrutura

```
src/
  songs/
    song.interface.ts         # tipo Song com decorators Swagger
    songs.service.ts          # carrega CSV, expõe 2 arrays ordenados
    songs.module.ts
  search/
    search-result.interface.ts  # tipos SearchResult, SearchStep, SearchStats
    search.service.ts           # algoritmos binary + sequential
    search.controller.ts        # endpoints REST com documentação Swagger
    search.module.ts
  app.module.ts
  main.ts                     # CORS + Swagger em /docs
assets/
  dataset.csv                 # 114.000 músicas do Spotify
```
