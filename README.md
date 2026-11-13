# PulseDeck

A warm, record-player-inspired dashboard built with Next.js 16.4.6, React 19.3 and TypeScript. Product: `/`. Single interactive component gallery: `/design-system`.

Playback uses real licensed recordings: **15 tracks in 5 categories** (Classical, Jazz, Acoustic, Ambient and Electronic; 3 each). Two complete MP3s are included locally; 13 stream directly from the artist and require internet. Native audio events drive time, duration, seeking, volume and end-of-track navigation. Favorites/preferences remain session-local. There is no account system or database. Open Music credits below the dashboard for attribution and source/license links.

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

Geometry is estimated from the supplied 1536 × 1024 dashboard/UI-board rasters. Local Geist Sans approximates the board's Plus Jakarta Sans. The CSS/SVG turntable and illustrated SVG covers approximate the reference sculpture and photographs; covers are not official album artwork.

See the QA report for actual build, media-engine, source and HTTP checks. Browser rendering, visual comparison, keyboard interaction and responsive acceptance remain unverified because the available Windows browser process fails to launch. This is not a claim that all eight workflow checkpoints are complete.

## Music pack

`public/audio/catalog.json` is the licensed catalog manifest, imported only by the server seed. Playlist totals are calculated from track IDs (3, 6, 6 and 3); categories calculate their actual track counts. No fake artist releases or notification timestamps are seeded. `public/audio/CREDITS.md` preserves attribution. Complete downloaded MP3s are unmodified; streamed recordings remain on the artist’s host.

Remote durations come from the artist catalog and are replaced by native media metadata in the player. Local recordings were probed with ffprobe and have RMS-derived waveform bins. Remote recordings use a decorative waveform, not an analyzed amplitude graph. No audio auto-starts on page load.
