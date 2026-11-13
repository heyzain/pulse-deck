'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {IconButton} from './Controls';
export function Overlay({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
 const ref=useRef<HTMLElement>(null);
 const closeRef=useRef(onClose);
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';const el=ref.current;el?.focus();
 const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'&&el){const nodes=Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')).filter(n=>n.getClientRects().length>0);const first=nodes[0],last=nodes.at(-1);if(!first){e.preventDefault();el.focus();}else if(e.shiftKey&&(document.activeElement===first||document.activeElement===el)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===el)){e.preventDefault();first.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',key);previous?.focus({preventScroll:true});};},[]);
 return <div className="overlay-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`overlay ${wide?'wide':''}`}><header className="overlay-header"><h2>{title}</h2><IconButton icon="close" label={`Close ${title}`} size="small" onClick={onClose}/></header>{children}</section></div>;
}
