import 'server-only';
import type {Catalog} from '../contracts';
// Never mutate this module-level fixture. Requests return fresh projected objects.
export const seed:Readonly<Catalog>={
 currentTrackId:'suffering',
 tracks:[
 {id:'suffering',title:'The Suffering',artist:'Eren',duration:215,cover:'/covers/ocean.svg',category:'classic'},
 {id:'fading',title:'Fading Hours',artist:'Eren',duration:252,cover:'/covers/forest.svg',category:'indie'},
 {id:'golden',title:'Golden Hour',artist:'Eren',duration:198,cover:'/covers/sunset.svg',category:'new'},
 {id:'slow',title:'Slow Morning',artist:'Luna',duration:234,cover:'/covers/window.svg',category:'instrumental'},
 {id:'rewind',title:'Rewind',artist:'The Analogues',duration:226,cover:'/covers/sunset.svg',category:'90s'},
 {id:'drift',title:'Drift Away',artist:'Luna',duration:281,cover:'/covers/ocean.svg',category:'instrumental'}],
 playlists:[{id:'eren',title:'Best of Eren',count:32,cover:'/covers/sunset.svg',trackIds:['suffering','fading','golden']},{id:'focus',title:'Focus Mix',count:24,cover:'/covers/forest.svg',trackIds:['slow','drift']},{id:'evening',title:'Evening Vibes',count:41,cover:'/covers/ocean.svg',trackIds:['drift','golden','fading']},{id:'daily',title:'Daily Chaos',count:18,cover:'/covers/window.svg',trackIds:['rewind','suffering','slow']}],
 categories:[{id:'classic',title:'Classic',description:'Timeless hits',icon:'record'},{id:'90s',title:'90s',description:'Retro vibes',icon:'tape'},{id:'instrumental',title:'Instrumental',description:'Focus & relax',icon:'guitar'},{id:'indie',title:'Indie',description:'Fresh & unique',icon:'headphones'},{id:'new',title:'New',description:'Latest releases',icon:'sparkles'}],
 notifications:[{id:'n1',title:'New release from Eren',body:'“Fading Hours” is out now!',time:'2m ago',kind:'release'},{id:'n2',title:'Playlist updated',body:'Your “Focus Mix” has 3 new songs.',time:'1h ago',kind:'playlist'},{id:'n3',title:'A little evening inspiration',body:'Your next favorite might be in Evening Vibes.',time:'3h ago',kind:'playlist'}]
};
