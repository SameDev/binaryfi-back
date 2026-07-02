# BinaryFi

Aplicação de música estilo Spotify construída sobre um dataset de **114.000 músicas reais do Spotify**. O projeto tem dois lados:

- **Back-end (NestJS)** — busca (binária e sequencial), metadados de capas com múltiplas fontes, eventos de usuário e recomendações.
- **Front-end (React + Vite)** — busca, player, recomendações, favoritos e preferências musicais.

Trabalho AV3 — Estrutura de Dados. O núcleo didático é a **Busca Binária** (O log n) comparada com a **Busca Sequencial** (O n).

---

## Como rodar

### Back-end

```bash
npm install
cp .env.example .env        # ajuste as variáveis se precisar
npm run start:dev
```

Sobe em `http://localhost:3000`. Documentação interativa (Swagger) em `http://localhost:3000/docs`.

### Front-end

```bash
cd frontend
npm install
cp .env.example .env        # aponte VITE_API_URL para o backend
npm run dev
```

Sobe em `http://localhost:5173` (padrão do Vite).

---

## Variáveis de ambiente

### Back-end (`.env` na raiz)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão `3000`). |
| `NODE_ENV` | Em `production`, o CORS é restrito a `CORS_ORIGIN`. |
| `CORS_ORIGIN` | Origens liberadas em produção (separadas por vírgula). |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Opcionais. Ativam a Spotify Web API como fonte prioritária de capas. |

### Front-end (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL do backend. |

> Nunca comite tokens reais. Os arquivos `.env` estão no `.gitignore`; use os `.env.example`.

### Trocar a porta / porta 3000 ocupada

O backend usa `process.env.PORT` (padrão `3000`). Se aparecer `EADDRINUSE: address already in use :::3000`, outro processo está usando a porta.

Descobrir e encerrar o processo (Windows):

```powershell
netstat -ano | findstr :3000
taskkill /PID NUMERO_DO_PID /F
```

Rodar em outra porta:

```powershell
# PowerShell
$env:PORT=3001
npm run start:dev
```

```cmd
:: CMD
set PORT=3001 && npm run start:dev
```

```bash
# Linux/Mac
PORT=3001 npm run start:dev
```

### Configurar a Spotify API (opcional)

1. Crie um app em <https://developer.spotify.com/dashboard>.
2. Copie **Client ID** e **Client Secret** para o `.env` do backend.
3. O backend usa o fluxo *Client Credentials* e passa a priorizar as capas oficiais do Spotify.

Sem essas chaves o sistema continua funcionando normalmente com Deezer e iTunes.

---

## Busca Binária (núcleo didático)

> **Busca Binária:** é o método tradicional de busca binária, adequado para encontrar um único elemento em um array ordenado. Ela divide repetidamente o intervalo de busca pela metade até encontrar o item desejado ou concluir que ele não existe.

- Os dados são carregados do CSV na inicialização e mantidos em **dois arrays ordenados**:
  - por **título** (`track_name`) — usado quando `by=title`;
  - por **artista** (`artists`) — usado quando `by=artist`.
- A ordenação é feita uma vez, no boot, garantindo que o array esteja ordenado antes de qualquer busca.
- `GET /search` retorna os `steps` (low, mid, high, comparação e ação) para visualização do algoritmo no front-end.
- A **busca sequencial** (`GET /search/sequential`) existe para comparar performance — não substitui a binária.
- A busca textual/paginada moderna do front-end é **complementar**: a busca binária continua sendo o método didático principal.

---

## Endpoints

### Busca

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/search?q=&by=title\|artist&page=&limit=` | Busca binária por prefixo (O log n) + steps. Paginado. |
| `GET` | `/search/sequential?q=&by=&page=&limit=` | Busca sequencial (O n) para comparação. |
| `GET` | `/genres` | Lista de gêneros do dataset com contagem. |

### Metadados / capas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/tracks/:trackId/metadata` | Metadados de uma faixa (capa, preview, link). |
| `POST` | `/tracks/metadata/batch` | Metadados de várias faixas de uma vez. Body: `{ "trackIds": [...] }`. |

Formato de retorno:

```json
{
  "trackId": "5SuOikwiRyPMVoIQDJUgSV",
  "title": "Comedy",
  "artist": "Gen Hoshino",
  "album": "Comedy",
  "coverUrl": "https://...",
  "previewUrl": "https://...",
  "externalUrl": "https://...",
  "source": "spotify | deezer | itunes | fallback"
}
```

### Eventos e recomendações

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/events` | Registra `search \| play \| favorite \| skip \| unfavorite`. |
| `GET` | `/events?userId=` | Histórico de interações (debug). |
| `GET` | `/recommendations?userId=&limit=&genres=pop,rock` | Recomendações personalizadas. |

Body de `/events`:

```json
{ "userId": "user_gabriel", "trackId": "5Suo...", "type": "play", "query": "opcional" }
```

---

## Como funciona o fallback de capas

O backend resolve a capa server-side (sem CORS no navegador) e cacheia o resultado. A ordem de prioridade é:

1. **Spotify Web API** — usando o `track_id` (se as chaves estiverem configuradas).
2. **Deezer API** — busca por artista + música.
3. **iTunes API** — busca por artista + música + álbum.
4. **Fallback visual** — o front-end desenha um gradiente/inicial bonito, sem card quebrado.

Cache:

- **Positivo** (achou capa): vários dias.
- **Negativo** (fallback): poucos minutos, para tentar novamente depois — falhas não ficam gravadas para sempre.
- O front-end agrupa os pedidos dos cards em **uma chamada em lote** (`/tracks/metadata/batch`) e reaproveita o `localStorage`. Um cache de fallback sem imagem expira rápido e é reatualizado automaticamente.

---

## Como funciona a recomendação

A recomendação é **real e calculada no backend** (`RecommendationsService`), não só no front.

- Começa pelos **gêneros preferidos** que o usuário escolhe no início.
- Adapta-se às interações (`play`, `favorite`, `skip`, `search`) registradas em `/events`.
- Cada faixa candidata recebe uma pontuação combinando:

```
score =
    afinidade de gênero
  + similaridade de atributos musicais (danceability, energy, acousticness,
    instrumentalness, valence, tempo — distância ao "centroide" do gosto)
  + afinidade com o artista
  + popularidade (peso moderado)
  + fator de exploração (descoberta de gêneros novos)
  - penalidade por música já ouvida demais
  - músicas puladas são descartadas
```

- Mistura o **familiar** com **descobertas**, evita ficar preso nos mesmos gêneros/músicas e diversifica limitando faixas por artista.

---

## Autenticação (estado atual)

Hoje o cadastro/login vive no front-end usando `localStorage`, mas **a senha pura não é mais salva**: guardamos apenas `SHA-256 + salt` (contas antigas são migradas no primeiro login).

**Próximo passo** (estrutura já preparada): mover usuários, favoritos, histórico e preferências para o backend, com:

- persistência (Prisma + SQLite);
- hash forte no servidor (`argon2`);
- sessão via JWT (`@nestjs/jwt`, `passport-jwt`).

O módulo de eventos já centraliza o histórico no backend, e as recomendações já consomem esses dados.

---

## Testes

```bash
npm test          # unit tests (backend)
npm run test:cov  # com cobertura
```

Front-end: `cd frontend && npm run build` (checagem de tipos + build de produção).

---

## Estrutura

```
src/
  songs/            # dataset em memória (arrays ordenados, índice por id, gêneros)
  search/           # busca binária + sequencial (com paginação)
  metadata/         # capas/preview com fallback Spotify -> Deezer -> iTunes
  events/           # histórico de interações do usuário
  recommendations/  # motor de recomendação por atributos musicais
  common/           # utilitários compartilhados (cache em memória)
  app.module.ts     # config + throttler + módulos
  main.ts           # CORS por ambiente + validação + Swagger

frontend/src/
  api/              # clientes HTTP (busca, metadados em lote, eventos, recomendações)
  hooks/            # useRecommendations, useTrackMetadata, useUserEvents, useAudioPlayer, useAuth...
  components/       # UI (busca, player, cards, preferências...)
  utils/            # cache de metadados, hash de senha, storage
```

---

## Próximos passos

- Persistir usuários/favoritos/histórico no backend (Prisma/SQLite) + JWT/argon2.
- Cache de metadados compartilhado (Redis) para múltiplas instâncias.
- React Query no front para cache HTTP mais robusto.
- Mais sinais na recomendação (tempo de escuta, sequência de faixas).
