import type {Track} from './contracts';

export type AudioPort = Pick<HTMLAudioElement, 'src' | 'currentTime' | 'duration' | 'volume' | 'error' | 'preload' | 'readyState' | 'addEventListener' | 'removeEventListener' | 'play' | 'pause' | 'load' | 'removeAttribute'>;
export interface PlaybackSnapshot {
  trackId?: string; playing: boolean; pending: boolean; position: number;
  duration: number; volume: number; error: string | null;
}
const initial: PlaybackSnapshot = {playing:false,pending:false,position:0,duration:0,volume:72,error:null};

// The native media element is the clock. Never simulate playback with a timer.
export class AudioEngine {
  private audio: AudioPort | null = null;
  private track?: Track;
  private snapshot = initial;
  private listeners = new Set<() => void>();
  private events: [string, EventListener][] = [];
  private generation = 0;
  private desiredPlaying = false;
  private pendingSeek: number | null = null;
  onEnded: () => void = () => {};
  setEndedHandler = (handler: () => void) => {this.onEnded=handler;};
  subscribe = (listener: () => void) => {this.listeners.add(listener);return () => this.listeners.delete(listener);};
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => initial;
  private update(patch: Partial<PlaybackSnapshot>) {
    this.snapshot = {...this.snapshot,...patch};
    this.listeners.forEach(listener => listener());
  }
  attach(audio: AudioPort) {
    this.audio = audio;
    audio.preload = 'metadata';
    audio.volume = this.snapshot.volume / 100;
    const bind = (type: string, callback: () => void) => {
      const handler: EventListener = callback;
      this.events.push([type,handler]);audio.addEventListener(type,handler);
    };
    const metadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) this.update({duration:audio.duration});
      if (this.pendingSeek !== null) {const target=this.pendingSeek;this.pendingSeek=null;this.seek(target);}
    };
    bind('loadedmetadata',metadata);bind('durationchange',metadata);
    bind('timeupdate',() => this.update({position:audio.currentTime}));
    bind('playing',() => {
      if(!this.desiredPlaying){audio.pause();return;}
      this.update({playing:true,pending:false,error:null});
    });
    bind('pause',() => this.update({playing:false}));
    bind('waiting',() => {if(this.desiredPlaying)this.update({pending:true});});
    // canplay only means data is ready; stay pending until playback actually starts.
    bind('error',() => {
      if(!audio.error)return;
      this.generation++;this.desiredPlaying=false;
      this.update({playing:false,pending:false,error:'This track could not be loaded. Please try again.'});
    });
    bind('ended',() => {this.update({playing:false,pending:false,position:this.snapshot.duration});this.onEnded();});
    if(this.track)this.loadTrack(this.track,this.desiredPlaying,true);
    return () => {
      this.generation++;
      this.events.forEach(([type,handler]) => audio.removeEventListener(type,handler));this.events=[];
      audio.pause();audio.removeAttribute('src');audio.load();this.audio=null;
    };
  }
  loadTrack = (track: Track, autoplay = false, force = false) => {
    if(!force && this.track?.id===track.id && this.track.audioSrc===track.audioSrc)return;
    this.generation++;this.track=track;this.desiredPlaying=autoplay;this.pendingSeek=null;
    this.update({trackId:track.id,playing:false,pending:autoplay,position:0,duration:track.duration,error:null});
    if(!this.audio)return;
    this.audio.pause();this.audio.src=track.audioSrc;this.audio.load();
    if(autoplay)this.setPlaying(true);
  };
  setPlaying = (playing: boolean) => {
    this.desiredPlaying=playing;const audio=this.audio;
    const generation=++this.generation;
    if(!playing){audio?.pause();this.update({playing:false,pending:false});return;}
    if(!audio || !this.track)return;
    this.update({pending:true,error:null});
    void audio.play().then(() => {
      if(generation===this.generation && this.desiredPlaying)this.update({playing:true,pending:false});
    },error => {
      if(generation!==this.generation)return;
      this.desiredPlaying=false;
      this.update({playing:false,pending:false,error:error?.name==='NotAllowedError'?'Your browser paused playback. Press Play to start the audio.':'Playback failed. Please try again.'});
    });
  };
  seek = (position: number) => {
    if(!Number.isFinite(position))return;
    const target=Math.max(0,Math.min(position,this.snapshot.duration));
    this.update({position:target});
    if(!this.audio || !this.audio.readyState){this.pendingSeek=target;return;}
    try{this.audio.currentTime=target;}catch{this.pendingSeek=target;}
  };
  setVolume = (volume: number) => {
    if(!Number.isFinite(volume))return;
    const next=Math.max(0,Math.min(100,volume));
    if(this.audio)this.audio.volume=next/100;
    this.update({volume:next});
  };
  retry = () => {if(this.track)this.loadTrack(this.track,true,true);};
}
