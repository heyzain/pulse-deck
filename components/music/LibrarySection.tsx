import type {Category, Playlist, Track} from '@/features/music/contracts';
import {Icon} from '@/components/ui/Icon';
import {PlaylistCard, ResourceState, TrackRow} from './Cards';

interface Props {
  playlists: Playlist[];
  tracks: Track[];
  filter: Category | 'all' | null;
  liked: Set<string>;
  pending: Set<string>;
  onPlay: (track: Track) => void;
  onLike: (track: Track) => void;
  onPlaylist: (id: string) => void;
  onViewLibrary: () => void;
  onBack: () => void;
}

export function LibrarySection(p: Props) {
  const filtered = p.filter !== null;
  const categoryId = p.filter && p.filter !== 'all' ? p.filter.id : null;
  const tracks = categoryId ? p.tracks.filter(track => track.category === categoryId) : p.tracks;
  const title = p.filter === 'all' ? 'All songs' : p.filter?.title;
  return <section id="library-content" className="playlist-section" aria-labelledby="library-title">
    <div className="section-heading">
      <h2 id="library-title">{filtered ? `${title} (${tracks.length})` : `Your Playlists (${p.playlists.length})`}</h2>
      {filtered
        ? <button className="text-action" onClick={p.onBack}><Icon name="back" size={20}/>Back to playlists</button>
        : <button className="text-action" onClick={p.onViewLibrary}>View all <Icon name="arrow"/></button>}
    </div>
    <span className="sr-only" role="status">{filtered ? `${tracks.length} ${title} tracks shown` : `${p.playlists.length} playlists shown`}</span>
    {filtered
      ? tracks.length ? <div className="inline-track-grid">{tracks.map(track => <TrackRow
          key={track.id} track={track} liked={p.liked.has(track.id)} pending={p.pending.has(track.id)}
          showPlayButton onPlay={() => p.onPlay(track)} onLike={() => p.onLike(track)}
        />)}</div> : <ResourceState title="No songs here yet" message="Choose another category or go back to your playlists."/>
      : <div className="playlist-grid">{p.playlists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist}
          onOpen={() => p.onPlaylist(playlist.id)}
          onPlay={() => {const first=p.tracks.find(track => track.id === playlist.trackIds[0]);if(first)p.onPlay(first);}}
        />)}</div>}
  </section>;
}
