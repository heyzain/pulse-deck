'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import {musicApi} from './api-client';
import type {Track,PlaylistDetail,LikeOperation} from './contracts';
import {upcomingTracks} from './queue';
type Remote<T>={key:string;data?:T;error?:string};
export function useResource<T>(key:string,loader:(signal:AbortSignal)=>Promise<T>){
 const [revision,setRevision]=useState(0);const requestKey=`${key}:${revision}`;const [state,setState]=useState<Remote<T>>({key:''});
 useEffect(()=>{const controller=new AbortController();let active=true;loader(controller.signal).then(data=>{if(active)setState({key:requestKey,data});},error=>{if(active&&!controller.signal.aborted)setState({key:requestKey,error:error instanceof Error?error.message:'Something went wrong. Please try again.'});});return()=>{active=false;controller.abort();};},[requestKey,loader]);
 return {data:state.key===requestKey?state.data:undefined,error:state.key===requestKey?state.error:undefined,loading:state.key!==requestKey,retry:()=>setRevision(r=>r+1)};
}
export function useSearch(query:string){const loader=useCallback(async(signal:AbortSignal)=>{await new Promise<void>((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},250);signal.addEventListener('abort',abort,{once:true});});return musicApi.search(query,signal);},[query]);return useResource(`search:${query}`,loader);}
// Cache only immutable demo detail reads, in the current browser module lifetime.
const detailCache=new Map<string,PlaylistDetail>();
export function usePlaylist(id:string){const loader=useCallback(async(signal:AbortSignal)=>{const cached=detailCache.get(id);if(cached)return cached;const data=await musicApi.playlist(id,signal);if(!signal.aborted)detailCache.set(id,data);return data;},[id]);return useResource(`playlist:${id}`,loader);}
export function useMusic(){
 const remote=useResource('catalog',musicApi.catalog);const [selectedId,setSelectedId]=useState<string|null>(null);const [playing,setPlaying]=useState(false);const [position,setPosition]=useState(0);const [volume,setVolume]=useState(72);const [shuffle,setShuffle]=useState(false);const [repeat,setRepeat]=useState(false);const [liked,setLiked]=useState<Set<string>>(()=>new Set());const [pending,setPending]=useState<Set<string>>(()=>new Set());const [likeError,setLikeError]=useState<{operation:LikeOperation;message:string}|null>(null);
 const operations=useRef(new Map<string,AbortController>());const active=useRef(true);
 useEffect(()=>{const ops=operations.current;active.current=true;return()=>{active.current=false;ops.forEach(c=>c.abort());ops.clear();};},[]);
 const catalog=remote.data;const track=catalog?.tracks.find(t=>t.id===(selectedId??catalog.currentTrackId))??catalog?.tracks[0];
 const selectTrack=useCallback((next:Track,autoplay=true)=>{setSelectedId(next.id);setPosition(0);setPlaying(autoplay);},[]);
 const queue=upcomingTracks(catalog?.tracks??[],track?.id,shuffle);
 const skip=useCallback((direction:number)=>{if(!catalog?.tracks.length)return;const current=catalog.tracks.findIndex(t=>t.id===track?.id);const next=direction>0?upcomingTracks(catalog.tracks,track?.id,shuffle)[0]??track:catalog.tracks[(current-1+catalog.tracks.length)%catalog.tracks.length];if(next)selectTrack(next,playing);},[catalog,track,selectTrack,playing,shuffle]);
 useEffect(()=>{if(!playing||!track)return;const timer=setInterval(()=>setPosition(value=>Math.min(value+1,track.duration)),1000);return()=>clearInterval(timer);},[playing,track]);
 useEffect(()=>{if(!track||position<track.duration||!playing)return;const timer=setTimeout(()=>{if(repeat)setPosition(0);else skip(1);},0);return()=>clearTimeout(timer);},[position,track,playing,repeat,skip]);
 const changeLike=useCallback(async(operation:LikeOperation)=>{const id=operation.trackId;if(operations.current.has(id))return;const controller=new AbortController();operations.current.set(id,controller);setPending(p=>new Set(p).add(id));setLikeError(null);try{const result=await musicApi.like(operation,controller.signal);if(active.current&&!controller.signal.aborted)setLiked(p=>{const next=new Set(p);if(result.liked)next.add(result.trackId);else next.delete(result.trackId);return next;});}catch(error){if(active.current&&!controller.signal.aborted)setLikeError({operation,message:error instanceof Error?error.message:'Could not update favorite.'});}finally{operations.current.delete(id);if(active.current)setPending(p=>{const next=new Set(p);next.delete(id);return next;});}},[]);
 return {...remote,catalog,track,queue,playing,setPlaying,position,setPosition,volume,setVolume,shuffle,setShuffle,repeat,setRepeat,liked,pending,likeError,changeLike,selectTrack,skip};
}
