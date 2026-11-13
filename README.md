# PulseDeck

A warm, record-player-inspired dashboard built with Next.js 16.4.6, React 19.3 and TypeScript. Product: `/`. Single interactive component gallery: `/design-system`.

Playback is a **silent simulation**. Search, playlist previews, favorites, notifications, seek, shuffle, repeat and volume are interactive. There is no streaming service, account system or database. Changes reset on reload.

## Run and verify

```powershell
npm ci
npm run dev
```

Production:

```powershell
npm run lint
npm run build
npm run start -- --port 3100
```

Keep the server running in another terminal:

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:3100'
npm test
```

Node 24 supports the test runner's `--test-isolation=none` option used here. Tests compile shared contracts/client code into ignored `.qa/test-modules`. They do not modify fixtures.

## Demo scenarios

Default server latency randomly chooses **1, 2 or 3 seconds**. Set variables before starting a server:

```powershell
$env:MUSIC_LATENCY_MS='0' # disable delay; 1000/2000/3000 fix it
$env:MUSIC_SCENARIO='error' # error or empty; unset for normal data
npm run start -- --port 3101
```

For scenario tests, start error and empty servers separately on 3101 and 3102. Set `TEST_ERROR_BASE_URL` and `TEST_EMPTY_BASE_URL` to their URLs in the test terminal, then run `npm test`. These two tests explicitly skip when their URLs are absent.

`PULSEDECK_BUILD_DIR` selects a separate build directory inside this repository, such as `.qa/next-build`. Use the same value for build/start. Next.js rejects external build directories.

## Source map

| Location | Responsibility |
| --- | --- |
| `components/ui` | Controls, icons, modal focus and dismissal |
| `components/music` | Dashboard, record player, cards and feature presentation |
| `components/design-system` | Gallery and isolated documentation examples |
| `design-system/tokens.css` | Semantic design tokens |
| `features/music/contracts.ts` | Shared types and runtime validation |
| `features/music/api-client.ts` | HTTP envelopes, timeout and cancellation |
| `features/music/use-music.ts` | Request lifecycle, detail cache and session state |
| `features/music/server` | Predictable server-only seed and data source |
| `app/api/music/route.ts` | Validated HTTP endpoints |

Read the [design specification](docs/design-spec.md), [architecture](docs/architecture.md) and [QA evidence](docs/visual-qa.md) for current acceptance status.

## Fidelity and verification limits

Geometry is estimated from the supplied 1536 × 1024 dashboard/UI-board rasters. Local Geist Sans approximates the board's Plus Jakarta Sans. The CSS/SVG turntable and illustrated SVG covers approximate the reference sculpture and photographs.

Build, lint and HTTP/client checks passed. Browser rendering, visual comparison, keyboard interaction and responsive acceptance remain unverified because the available Windows browser process fails to launch. This is not a claim that all eight workflow checkpoints are complete.
