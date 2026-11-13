'use client';

import {useLayoutEffect,useRef,useState} from 'react';
import type {Track} from '@/features/music/contracts';
import {Badge,Button,IconButton} from '@/components/ui/Controls';
import {Turntable} from './Turntable';
import {PlayerControls,Waveform,type PlayerControlsProps} from './PlayerControls';

interface Props {
  track: Track;
  controls: PlayerControlsProps;
  position: number;
  duration: number;
  onSeek: (position:number) => void;
  liked: boolean;
  likePending: boolean;
  onLike: () => void;
  error: string | null;
  onRetry: () => void;
}

export function ExpandedPlayer(p: Props) {
  const ref=useRef<HTMLDivElement>(null);
  const [settings,setSettings]=useState(false);
  useLayoutEffect(() => {
    // Match the existing record's angle, including when opened while paused.
    const source=document.querySelector('.player-hero .record-rotor')?.getAnimations()[0];
    const target=ref.current?.querySelector('.record-rotor')?.getAnimations()[0];
    if(source&&target)target.currentTime=source.currentTime;
  },[]);
  return <div ref={ref} className="expanded-player">
    <Turntable playing={p.controls.playing} pending={p.controls.pending}/>
    <div className="player-info">
      <div className="player-status"><Badge playing={p.controls.playing} pending={p.controls.pending} error={!!p.error}/></div>
      <div className="track-heading">
        <div><h3>{p.track.title}</h3><p>{p.track.artist}</p></div>
        <IconButton icon="heart" label={`${p.liked?'Unlike':'Like'} ${p.track.title}`} className={p.liked?'liked':''} aria-pressed={p.liked} aria-busy={p.likePending} disabled={p.likePending} onClick={p.onLike}/>
      </div>
      <Waveform position={p.position} duration={p.duration} waveform={p.track.waveform} onSeek={p.onSeek}/>
      <PlayerControls {...p.controls} onSettings={() => setSettings(open=>!open)}/>
      {settings&&<div className="expanded-settings" aria-label="Playback settings">
        <div className="settings-row"><span>Shuffle</span><Button variant={p.controls.shuffle?'secondary':'ghost'} aria-pressed={p.controls.shuffle} onClick={p.controls.onShuffle}>{p.controls.shuffle?'On':'Off'}</Button></div>
        <div className="settings-row"><span>Repeat track</span><Button variant={p.controls.repeat?'secondary':'ghost'} aria-pressed={p.controls.repeat} onClick={p.controls.onRepeat}>{p.controls.repeat?'On':'Off'}</Button></div>
      </div>}
      {p.error&&<div className="inline-error" role="alert"><span>{p.error}</span><Button variant="secondary" onClick={p.onRetry}>Retry audio</Button></div>}
    </div>
  </div>;
}
