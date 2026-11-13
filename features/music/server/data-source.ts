import 'server-only';
import {seed} from './seed';
import type {Catalog,PlaylistDetail,SearchResults} from '../contracts';
export function getCatalog(empty=false):Catalog{return empty?{tracks:[],playlists:[],categories:[],notifications:[],currentTrackId:null}:structuredClone(seed);}
export function searchMusic(query:string,empty=false):SearchResults{const catalog=getCatalog(empty);const q=query.trim().toLocaleLowerCase();return {tracks:catalog.tracks.filter(t=>`${t.title} ${t.artist}`.toLowerCase().includes(q)),playlists:catalog.playlists.filter(p=>p.title.toLowerCase().includes(q)),artists:[...new Set(catalog.tracks.map(t=>t.artist))].filter(a=>a.toLowerCase().includes(q))};}
export function getPlaylist(id:string,empty=false):PlaylistDetail|null{const catalog=getCatalog(empty);const playlist=catalog.playlists.find(p=>p.id===id);return playlist?{playlist,tracks:catalog.tracks.filter(t=>playlist.trackIds.includes(t.id))}:null;}
export function responseDelay():number{const configured=process.env.MUSIC_LATENCY_MS;if(configured!==undefined&&['0','1000','2000','3000'].includes(configured))return Number(configured);return (1+Math.floor(Math.random()*3))*1000;}
export function delayResponse(signal:AbortSignal){return new Promise<void>((resolve,reject)=>{if(signal.aborted){reject(signal.reason);return;}const abort=()=>{clearTimeout(timer);reject(signal.reason);};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},responseDelay());signal.addEventListener('abort',abort,{once:true});});}
