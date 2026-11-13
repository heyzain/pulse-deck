import { brand } from '@/config/brand';
import Link from 'next/link';
export function EqualizerMark({className=''}:{className?:string}) { return <svg className={className} aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="currentColor">{[12,25,40,28,12].map((h,i)=><rect key={i} x={3+i*9} y={(48-h)/2} width="6" height={h} rx="3"/>)}</svg>; }
export function AppLogo(){return <Link className="app-logo" href="/" aria-label={`${brand.name} home`}><EqualizerMark/><span>{brand.name}</span></Link>;}
