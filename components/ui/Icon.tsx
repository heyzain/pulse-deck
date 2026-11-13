import type { CSSProperties } from 'react';
export type IconName = 'home'|'heart'|'music'|'radio'|'stats'|'folder'|'settings'|'search'|'bell'|'apps'|'play'|'pause'|'next'|'previous'|'shuffle'|'repeat'|'volume'|'mute'|'sliders'|'more'|'arrow'|'back'|'close'|'record'|'tape'|'guitar'|'headphones'|'sparkles'|'library'|'user'|'help'|'logout'|'check'|'expand';
const paths: Record<IconName, React.ReactNode> = {
 expand:<><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></>,
 home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>,
 heart:<path d="M20.7 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-.9-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.7-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
 music:<><path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/></>,
 radio:<><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" fill="none"/></>,
 stats:<><path d="M4 20v-7h3v7ZM11 20V7h3v13ZM18 20V3h3v17Z"/></>,
 folder:<path d="M3 6a2 2 0 0 1 2-2h5l2 3h8a1 1 0 0 1 1 1v12H3Z"/>,
 settings:<><path d="m9 3 1-2h4l1 3 3 1 3-1 2 4-2 2v4l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-4L1 8l2-4 3 1Z" transform="translate(1 1) scale(.9)"/><circle cx="12" cy="12" r="3"/></>,
 search:<><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></>,
 bell:<><path d="M5 9a7 7 0 0 1 14 0c0 7 3 8 3 9H2c0-1 3-2 3-9ZM9 21h6"/></>,
 apps:<>{[4,14].flatMap(x=>[4,14].map(y=><rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="2.4" fill="currentColor" stroke="none"/>))}</>,
 play:<path d="m7 3 14 9-14 9Z" fill="currentColor" strokeLinejoin="round"/>,
 pause:<><path d="M7 4v16M17 4v16" strokeWidth="4"/></>,
 next:<><path d="m5 5 11 7L5 19ZM19 4v16"/></>,
 previous:<><path d="m19 5-11 7 11 7ZM5 4v16"/></>,
 shuffle:<><path d="M3 6h3c5 0 7 12 12 12h3M17 14l4 4-4 4M3 18h3c2 0 3-2 5-5m3-6c1-1 2-1 4-1h3M17 2l4 4-4 4"/></>,
 repeat:<><path d="M3 10V7a2 2 0 0 1 2-2h15M16 1l4 4-4 4M21 14v3a2 2 0 0 1-2 2H4M8 15l-4 4 4 4"/></>,
 volume:<><path d="M3 9h4l5-5v16l-5-5H3ZM16 8a6 6 0 0 1 0 8M19 4a12 12 0 0 1 0 16"/></>,
 mute:<><path d="M3 9h4l5-5v16l-5-5H3M17 9l6 6M23 9l-6 6"/></>,
 sliders:<>{[6,12,18].map((y,i)=><g key={y}><path d={`M3 ${y}h18`}/><circle cx={i===1?16:8} cy={y} r="2.4" fill="var(--scene)"/></g>)}</>,
 more:<>{[5,12,19].map(y=><circle key={y} cx="12" cy={y} r="1.5" fill="currentColor"/>)}</>,
 arrow:<path d="M3 12h18m-7-7 7 7-7 7"/>, back:<path d="M21 12H3m7-7-7 7 7 7"/>, close:<path d="m6 6 12 12M6 18 18 6"/>,
 record:<><circle cx="12" cy="12" r="10" fill="var(--icon-accent-fill, none)"/><circle cx="12" cy="12" r="4" fill="var(--surface)"/><circle cx="12" cy="12" r=".8" fill="currentColor"/></>,
 tape:<><rect x="2" y="5" width="20" height="14" rx="2" fill="var(--icon-accent-fill, none)"/><path d="M3 15h18M9 9h6"/><circle cx="7" cy="10" r="2" fill="var(--surface)"/><circle cx="17" cy="10" r="2" fill="var(--surface)"/></>,
 guitar:<><path d="m13 12 7-9 2 2-8 9c4 5-2 10-6 7-7-4-2-11 3-8l7-10" fill="var(--icon-accent-fill, none)"/><path d="M8 16l3 3M20 2l2 2"/></>,
 headphones:<><path d="M4 15v-4a8 8 0 0 1 16 0v4"/><rect x="2" y="12" width="5" height="9" rx="2" fill="var(--icon-accent-fill, none)"/><rect x="17" y="12" width="5" height="9" rx="2" fill="var(--icon-accent-fill, none)"/></>,
 sparkles:<><path d="m9 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM19 13l1 3 3 1-3 1-1 4-1-4-3-1 3-1Z" fill="var(--icon-accent-fill, none)"/></>,
 library:<><path d="m3 7 9-5 9 5-9 5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
 user:<><circle cx="12" cy="6" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></>, help:<><circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01"/></>, logout:<><path d="M10 3H3v18h7M10 12h12m-5-5 5 5-5 5"/></>, check:<path d="m4 12 5 5L20 6"/>
};
export function Icon({name,size=24,style,className=''}:{name:IconName;size?:number;style?:CSSProperties;className?:string}) { return <svg aria-hidden="true" className={`icon icon-${name} ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>{paths[name]}</svg>; }
