export interface Track { id: string; title: string; artist: string; duration: number; cover: string; category: string; audioSrc: string; sourceUrl: string; licenseUrl: string; waveform?: number[] }
export interface Playlist { id: string; title: string; count: number; cover: string; trackIds: string[] }
export interface Category { id: string; title: string; description: string; icon: string }
export interface MusicNotification { id: string; title: string; body: string; time: string; kind: 'release' | 'playlist' }
export interface Catalog { tracks: Track[]; playlists: Playlist[]; categories: Category[]; notifications: MusicNotification[]; currentTrackId: string | null }
export interface PlaylistDetail { playlist: Playlist; tracks: Track[] }
export interface SearchResults { tracks: Track[]; playlists: Playlist[]; artists: string[] }
export interface LikeOperation { trackId: string; liked: boolean }
export interface LikeResult extends LikeOperation { persisted: false }
export type Envelope<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

const object = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;
export const isTrack = (x: unknown): x is Track => object(x) && ['id','title','artist','cover','category','audioSrc','sourceUrl','licenseUrl'].every(k => typeof x[k] === 'string') && typeof x.duration === 'number' && Number.isFinite(x.duration) && x.duration > 0 && (x.waveform === undefined || Array.isArray(x.waveform) && x.waveform.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0));
export const isPlaylist = (x: unknown): x is Playlist => object(x) && ['id','title','cover'].every(k => typeof x[k] === 'string') && typeof x.count === 'number' && Number.isSafeInteger(x.count) && x.count >= 0 && Array.isArray(x.trackIds) && x.trackIds.every(id => typeof id === 'string');
export const isCatalog = (x: unknown): x is Catalog => object(x) && Array.isArray(x.tracks) && x.tracks.every(isTrack) && Array.isArray(x.playlists) && x.playlists.every(isPlaylist) && Array.isArray(x.categories) && x.categories.every(c => object(c) && ['id','title','description','icon'].every(k => typeof c[k] === 'string')) && Array.isArray(x.notifications) && x.notifications.every(n => object(n) && ['id','title','body','time'].every(k => typeof n[k] === 'string') && ['release','playlist'].includes(n.kind as string)) && (x.currentTrackId === null || typeof x.currentTrackId === 'string');
export const isSearchResults = (x: unknown): x is SearchResults => object(x) && Array.isArray(x.tracks) && x.tracks.every(isTrack) && Array.isArray(x.playlists) && x.playlists.every(isPlaylist) && Array.isArray(x.artists) && x.artists.every(a => typeof a === 'string');
export const isPlaylistDetail = (x: unknown): x is PlaylistDetail => object(x) && isPlaylist(x.playlist) && Array.isArray(x.tracks) && x.tracks.every(isTrack);
export const isLikeOperation = (x: unknown): x is LikeOperation => object(x) && typeof x.trackId === 'string' && typeof x.liked === 'boolean';
export const isLikeResult = (x: unknown): x is LikeResult => isLikeOperation(x) && object(x) && x.persisted === false;
