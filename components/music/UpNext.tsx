'use client';

import {useId, useState} from 'react';
import type {Track} from '@/features/music/contracts';
import {Icon} from '@/components/ui/Icon';
import {Cover, ResourceState} from './Cards';
import {formatTime} from './PlayerControls';

export function QueueList({tracks, onPlay}: {tracks: readonly Track[]; onPlay: (track: Track) => void}) {
  if (!tracks.length) return <ResourceState title="You're all caught up" message="More songs will appear here as your library grows."/>;
  return <ol className="queue-list" aria-label="Upcoming songs in playback order">
    {tracks.map((track, index) => <li key={track.id}>
      <button className={`queue-track ${index === 0 ? 'is-next' : ''}`} onClick={() => onPlay(track)} aria-label={`Play ${track.title} by ${track.artist}${index === 0 ? ', next in queue' : ''}`}>
        <Cover src={track.cover}/>
        <span className="queue-track-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
        <time>{formatTime(track.duration)}</time>
        <Icon name="play" size={15}/>
      </button>
    </li>)}
  </ol>;
}

export function UpNext({tracks, onPlay, onViewQueue, repeat = false}: {tracks: readonly Track[]; onPlay: (track: Track) => void; onViewQueue: () => void; repeat?: boolean}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <aside className={`up-next ${expanded ? 'is-expanded' : ''}`} aria-labelledby={`${id}-heading`}>
    <header className="queue-heading">
      <div><h2 id={`${id}-heading`}>Up Next</h2>{repeat && <p>After this track repeats</p>}</div>
      <button className="queue-toggle" aria-expanded={expanded} aria-controls={`${id}-content`} aria-label={`${expanded ? 'Collapse' : 'Expand'} Up Next`} onClick={() => setExpanded(value => !value)}><Icon name={expanded ? 'close' : 'music'} size={22}/></button>
    </header>
    <div className="queue-preview" id={`${id}-content`}>
      <QueueList tracks={tracks.slice(0, 4)} onPlay={onPlay}/>
      {!!tracks.length && <button className="text-action queue-view" onClick={onViewQueue}>View Queue <span>({tracks.length})</span><Icon name="arrow" size={18}/></button>}
    </div>
  </aside>;
}
