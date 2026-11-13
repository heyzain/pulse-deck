import 'server-only';
import pack from '@/public/audio/catalog.json';
import type {Catalog,Track} from '../contracts';

// Artist-sourced licensed recordings, with real membership-derived totals.
const tracks:Track[]=pack;
const definitions=[
 {id:'acoustic',title:'Acoustic Mornings',cover:'/covers/window.svg',categories:['acoustic']},
 {id:'focus',title:'Focus Mix',cover:'/covers/forest.svg',categories:['classical','ambient']},
 {id:'evening',title:'Evening Vibes',cover:'/covers/ocean.svg',categories:['jazz','ambient']},
 {id:'electronic',title:'Electronic Sessions',cover:'/covers/sunset.svg',categories:['electronic']},
];
const playlists=definitions.map(({categories,...playlist})=>{
 const trackIds=tracks.filter(track=>categories.includes(track.category)).map(track=>track.id);
 return {...playlist,trackIds,count:trackIds.length};
});
const categories=[
 {id:'classical',title:'Classical',icon:'record'},
 {id:'jazz',title:'Jazz',icon:'tape'},
 {id:'acoustic',title:'Acoustic',icon:'guitar'},
 {id:'ambient',title:'Ambient',icon:'headphones'},
 {id:'electronic',title:'Electronic',icon:'sparkles'},
].map(category=>({...category,description:tracks.filter(track=>track.category===category.id).length+' tracks'}));
export const seed:Readonly<Catalog>={currentTrackId:'gymnopedie-no-1',tracks,playlists,categories,notifications:[]};
