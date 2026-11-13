import type {Track} from './contracts';

// Derive the queue from the existing catalog and current track. No second player state.
export function upcomingTracks(tracks: readonly Track[], currentId: string | undefined, shuffle: boolean): Track[] {
  // A stable shuffled ring preserves the displayed order across track advances.
  const score = (id: string) => {
    let hash = 2166136261;
    for (const char of `PulseDeck:${id}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  };
  const ordered = shuffle ? [...tracks].sort((a, b) => score(a.id) - score(b.id) || a.id.localeCompare(b.id)) : [...tracks];
  const index = ordered.findIndex(track => track.id === currentId);
  if (index < 0) return ordered;
  return [...ordered.slice(index + 1), ...ordered.slice(0, index)];
}
