import type {Track} from '@/features/music/contracts';

export function MusicCredits({tracks}: {tracks: readonly Track[]}) {
  return <div className="music-credits">
    <p className="settings-label">These recordings are by Kevin MacLeod (incompetech.com), used under Creative Commons Attribution 4.0. Two recordings are included locally; the others stream from the artist and require an internet connection. Recordings are unmodified. Cover illustrations are PulseDeck placeholders, not official album artwork.</p>
    <p className="settings-label"><a href="https://incompetech.com/music/royalty-free/music.html" target="_blank" rel="noreferrer">Artist catalog</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a></p>
    <ul>{tracks.map(track => <li key={track.id}><strong>{track.title}</strong><span>{track.artist}</span><a href={track.sourceUrl} target="_blank" rel="noreferrer">Original recording</a> · <a href={track.licenseUrl} target="_blank" rel="noreferrer">License</a></li>)}</ul>
  </div>;
}
