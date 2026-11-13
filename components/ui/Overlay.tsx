'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {IconButton} from './Controls';
export function Overlay({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
 const ref=useRef<HTMLElement>(null);
 const closeRef=useRef(onClose);
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
 const previous=document.activeElement as HTMLElement|null;
 const scrollX=window.scrollX,scrollY=window.scrollY;
 const el=ref.current;el?.focus({preventScroll:true});
 // Keep the actual document scrollbar and its geometry intact. Lock background
 // input/position instead of hiding overflow or moving/resizing the page body.
 const stopBackgroundScroll=(event:WheelEvent|TouchEvent)=>{
   if('ctrlKey' in event&&event.ctrlKey)return;
   if('touches' in event&&event.touches.length>1)return;
   if(!el?.contains(event.target as Node))event.preventDefault();
 };
 const pinPosition=()=>{
   if(window.scrollX!==scrollX||window.scrollY!==scrollY)window.scrollTo({left:scrollX,top:scrollY,behavior:'instant'});
 };
 document.addEventListener('wheel',stopBackgroundScroll,{passive:false,capture:true});
 document.addEventListener('touchmove',stopBackgroundScroll,{passive:false,capture:true});
 window.addEventListener('scroll',pinPosition,{passive:true});
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'&&el){const nodes=Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')).filter(n=>n.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(!first){e.preventDefault();el.focus();}else if(e.shiftKey&&(document.activeElement===first||document.activeElement===el)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===el)){e.preventDefault();first.focus();}}};document.addEventListener('keydown',key);return()=>{
 document.removeEventListener('wheel',stopBackgroundScroll,true);
 document.removeEventListener('touchmove',stopBackgroundScroll,true);
 window.removeEventListener('scroll',pinPosition);
 document.removeEventListener('keydown',key);
 previous?.focus({preventScroll:true});
 };},[]);
 return <div className="overlay-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`overlay ${wide?'wide':''}`}><header className="overlay-header"><h2>{title}</h2><IconButton icon="close" label={`Close ${title}`} size="small" onClick={onClose}/></header>{children}</section></div>;
}
