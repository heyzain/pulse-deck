import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const compiled=path.join(root,'.qa','test-modules');
await mkdir(compiled,{recursive:true});
for(const name of ['contracts','api-client','queue','audio-engine','favorites']){const source=await readFile(path.join(root,'features/music',`${name}.ts`),'utf8');await writeFile(path.join(compiled,`${name}.js`),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);}
const contracts=require(path.join(compiled,'contracts.js'));
const {request}=require(path.join(compiled,'api-client.js'));
const {upcomingTracks}=require(path.join(compiled,'queue.js'));
const {AudioEngine}=require(path.join(compiled,'audio-engine.js'));
const {saveFavorite}=require(path.join(compiled,'favorites.js'));
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:3000';

test('optimistic favorite updates immediately, rolls back failed unlike, and retries',async()=>{
 const liked=new Set();const apply=(id,value)=>{if(value)liked.add(id);else liked.delete(id);};
 const signal=new AbortController().signal;let finish;
 const first=saveFavorite({trackId:'a',liked:true},false,apply,()=>new Promise(resolve=>{finish=resolve;}),signal);
 assert.equal(liked.has('a'),true);finish({trackId:'a',liked:true,persisted:false});await first;
 let fail;const unlike=saveFavorite({trackId:'a',liked:false},true,apply,()=>new Promise((_resolve,reject)=>{fail=reject;}),signal);
 assert.equal(liked.has('a'),false);const failed=assert.rejects(unlike,/offline/);fail(new Error('offline'));await failed;assert.equal(liked.has('a'),true);
 await saveFavorite({trackId:'a',liked:false},true,apply,async op=>({...op,persisted:false}),signal);assert.equal(liked.has('a'),false);
});

test('optimistic rollback stays attached to its track during concurrent favorites',async()=>{
 const liked=new Set();const apply=(id,value)=>{if(value)liked.add(id);else liked.delete(id);};
 const signal=new AbortController().signal;let failA,finishB;
 const a=saveFavorite({trackId:'a',liked:true},false,apply,()=>new Promise((_resolve,reject)=>{failA=reject;}),signal);
 const b=saveFavorite({trackId:'b',liked:true},false,apply,()=>new Promise(resolve=>{finishB=resolve;}),signal);
 assert.deepEqual([...liked],['a','b']);const failed=assert.rejects(a,/offline/);failA(new Error('offline'));await failed;assert.deepEqual([...liked],['b']);
 finishB({trackId:'b',liked:true,persisted:false});await b;assert.deepEqual([...liked],['b']);
});

test('optimistic favorite rejects a mismatched acknowledgement and restores state',async()=>{
 const liked=new Set();const apply=(id,value)=>{if(value)liked.add(id);else liked.delete(id);};
 await assert.rejects(saveFavorite({trackId:'a',liked:true},false,apply,async()=>({trackId:'wrong',liked:true,persisted:false}),new AbortController().signal),/did not match/);
 assert.equal(liked.size,0);
});

class FakeAudio extends EventTarget {
 src='';currentTime=0;duration=205;volume=1;error=null;preload='';readyState=1;
 play=()=>Promise.resolve();pause=()=>this.dispatchEvent(new Event('pause'));load=()=>{};removeAttribute=()=>{this.src='';};
}
const audioTrack=(id)=>({id,title:id,artist:'Kevin MacLeod',duration:205,cover:'/covers/ocean.svg',category:'acoustic',audioSrc:`/audio/${id}.mp3`,sourceUrl:'https://incompetech.com',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'});
test('media events drive time, duration, volume, seeking and ending',async()=>{
 const engine=new AudioEngine(),audio=new FakeAudio();const detach=engine.attach(audio);engine.loadTrack(audioTrack('carefree'));
 assert.equal(engine.getSnapshot().playing,false);assert.equal(audio.src,'/audio/carefree.mp3');
 audio.duration=205.37;audio.dispatchEvent(new Event('loadedmetadata'));assert.equal(engine.getSnapshot().duration,205.37);
 engine.setPlaying(true);await Promise.resolve();assert.equal(engine.getSnapshot().playing,true);
 audio.currentTime=42;audio.dispatchEvent(new Event('timeupdate'));assert.equal(engine.getSnapshot().position,42);
 engine.seek(1000);assert.equal(audio.currentTime,205.37);engine.setVolume(25);assert.equal(audio.volume,.25);
 let ends=0;engine.onEnded=()=>ends++;audio.dispatchEvent(new Event('ended'));assert.equal(ends,1);
 detach();assert.equal(audio.src,'');
});
test('late play rejection cannot overwrite a newer track; blocked playback can retry',async()=>{
 const engine=new AudioEngine(),audio=new FakeAudio();engine.attach(audio);engine.loadTrack(audioTrack('first'));
 let rejectOld;audio.play=()=>new Promise((_resolve,reject)=>{rejectOld=reject;});engine.setPlaying(true);
 engine.loadTrack(audioTrack('second'));rejectOld(new DOMException('Interrupted','AbortError'));await Promise.resolve();assert.equal(engine.getSnapshot().error,null);assert.equal(engine.getSnapshot().trackId,'second');
 audio.play=()=>Promise.reject(new DOMException('Gesture required','NotAllowedError'));engine.setPlaying(true);await Promise.resolve();assert.match(engine.getSnapshot().error,/Press Play/);assert.equal(engine.getSnapshot().playing,false);
 audio.play=()=>Promise.resolve();engine.retry();await Promise.resolve();assert.equal(engine.getSnapshot().playing,true);assert.equal(engine.getSnapshot().error,null);
});
test('pause invalidates a pending play and pre-metadata seeking is preserved',async()=>{
 const engine=new AudioEngine(),audio=new FakeAudio();engine.attach(audio);engine.loadTrack(audioTrack('carefree'));
 let resolvePlay;audio.play=()=>new Promise(resolve=>{resolvePlay=resolve;});engine.setPlaying(true);engine.setPlaying(false);resolvePlay();await Promise.resolve();assert.equal(engine.getSnapshot().playing,false);
 audio.readyState=0;engine.seek(40);audio.readyState=1;audio.dispatchEvent(new Event('loadedmetadata'));assert.equal(audio.currentTime,40);
});

test('track transitions stay loading through canplay and rapid skips, until actual playback',async()=>{
 const engine=new AudioEngine(),audio=new FakeAudio();engine.attach(audio);engine.loadTrack(audioTrack('first'));
 engine.setPlaying(true);await Promise.resolve();
 let startSecond;audio.play=()=>new Promise(resolve=>{startSecond=resolve;});
 engine.loadTrack(audioTrack('second'),true);
 assert.equal(engine.getSnapshot().playing,false);assert.equal(engine.getSnapshot().pending,true);
 audio.dispatchEvent(new Event('canplay'));assert.equal(engine.getSnapshot().pending,true);
 let startThird;audio.play=()=>new Promise(resolve=>{startThird=resolve;});engine.loadTrack(audioTrack('third'),true);
 startSecond();await Promise.resolve();assert.equal(engine.getSnapshot().trackId,'third');assert.equal(engine.getSnapshot().pending,true);
 startThird();await Promise.resolve();assert.equal(engine.getSnapshot().pending,false);assert.equal(engine.getSnapshot().playing,true);
});

test('late native playing events cannot restart cancelled buffering',async()=>{
 const engine=new AudioEngine(),audio=new FakeAudio();engine.attach(audio);engine.loadTrack(audioTrack('first'));
 let start;audio.play=()=>new Promise(resolve=>{start=resolve;});engine.setPlaying(true);engine.setPlaying(false);
 audio.dispatchEvent(new Event('playing'));start();await Promise.resolve();
 assert.equal(engine.getSnapshot().playing,false);assert.equal(engine.getSnapshot().pending,false);
});

test('queue wraps catalog order, excludes the current track and handles small collections',()=>{
 const tracks=['a','b','c','d'].map(id=>({id}));
 assert.deepEqual(upcomingTracks(tracks,'c',false).map(t=>t.id),['d','a','b']);
 assert.deepEqual(upcomingTracks([],undefined,false),[]);
 assert.deepEqual(upcomingTracks([{id:'only'}],'only',true),[]);
 assert.deepEqual(upcomingTracks(tracks,'missing',false),tracks);
});

test('shuffle queue is stable, complete, immutable and preserves upcoming order on advance',()=>{
 const tracks=Object.freeze(['a','b','c','d','e'].map(id=>Object.freeze({id})));
 const first=upcomingTracks(tracks,'a',true);
 assert.deepEqual(first,upcomingTracks(tracks,'a',true));
 assert.equal(new Set(first.map(t=>t.id)).size,4);
 assert.ok(first.every(t=>t.id!=='a'));
 assert.deepEqual(upcomingTracks(tracks,first[0].id,true),[...first.slice(1),tracks[0]]);
 assert.deepEqual(tracks.map(t=>t.id),['a','b','c','d','e']);
});
test('HTTP catalog, search and detail agree on IDs and metadata',async()=>{
 const response=await fetch(`${base}/api/music?resource=catalog`);assert.equal(response.status,200);const catalog=await response.json();assert.equal(catalog.ok,true);assert.ok(contracts.isCatalog(catalog.data));assert.equal(catalog.data.tracks[0].title,'Gymnopedie No. 1');assert.equal(catalog.data.tracks.length,15);for(const p of catalog.data.playlists)assert.equal(p.count,p.trackIds.length);for(const c of catalog.data.categories)assert.equal(c.description,catalog.data.tracks.filter(t=>t.category===c.id).length+' tracks');for(const t of catalog.data.tracks){assert.ok(t.audioSrc);assert.equal(t.licenseUrl,'https://creativecommons.org/licenses/by/4.0/');}
 const [search,detail]=await Promise.all([fetch(`${base}/api/music?resource=search&q=Kevin`).then(r=>r.json()),fetch(`${base}/api/music?resource=playlist&id=acoustic`).then(r=>r.json())]);assert.ok(contracts.isSearchResults(search.data));assert.ok(search.data.tracks.every(t=>t.artist==='Kevin MacLeod'));assert.ok(contracts.isPlaylistDetail(detail.data));assert.ok(detail.data.tracks.every(t=>detail.data.playlist.trackIds.includes(t.id)));
});
test('unknown searches return predictable empty lists',async()=>{const response=await fetch(`${base}/api/music?resource=search&q=zzzz-no-match`);const result=await response.json();assert.deepEqual(result.data,{tracks:[],playlists:[],artists:[]});});

test('included recordings support byte-range seeking over HTTP',async()=>{
 const catalog=await fetch(`${base}/api/music`).then(r=>r.json());
 const local=catalog.data.tracks.filter(t=>t.audioSrc.startsWith('/audio/'));
 assert.equal(local.length,2);
 for(const track of local){
  const response=await fetch(base+track.audioSrc,{headers:{Range:'bytes=0-1023'}});
  assert.equal(response.status,206);assert.match(response.headers.get('content-range'),/^bytes 0-1023\/[0-9]+$/);
  assert.equal((await response.arrayBuffer()).byteLength,1024);
 }
});
test('HTTP rejects invalid resources, identifiers, JSON and favorite operations',async()=>{
 const requests=[['?resource=unknown',{},400],['?resource=playlist&id=../invalid',{},400],['?resource=playlist&id=missing',{},404],['?resource=search&q='+('a'.repeat(121)),{},400],['',{method:'POST',body:'bad'},400],['',{method:'POST',body:JSON.stringify({trackId:'carefree',liked:'yes'})},400],['',{method:'POST',body:JSON.stringify({trackId:'absent',liked:true})},404]];
 await Promise.all(requests.map(async([suffix,init,status])=>{const response=await fetch(`${base}/api/music${suffix}`,init);assert.equal(response.status,status);const body=await response.json();assert.equal(body.ok,false);assert.equal(typeof body.error.code,'string');}));
});
test('desired-state favorite acknowledgements are repeatable and do not mutate seed',async()=>{
 const before=await fetch(`${base}/api/music`).then(r=>r.json());const op={trackId:'carefree',liked:true};
 const responses=await Promise.all([0,1].map(()=>fetch(`${base}/api/music`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(op)}).then(r=>r.json())));for(const result of responses)assert.deepEqual(result.data,{...op,persisted:false});const after=await fetch(`${base}/api/music`).then(r=>r.json());assert.deepEqual(after,before);
});
test('runtime guards reject malformed payloads',()=>{assert.equal(contracts.isTrack({id:'x',duration:-1}),false);assert.equal(contracts.isCatalog({tracks:[]}),false);assert.equal(contracts.isSearchResults({tracks:[],playlists:[],artists:[7]}),false);assert.equal(contracts.isLikeResult({trackId:'x',liked:true,persisted:true}),false);for(const count of [-1,NaN,Infinity,1.5])assert.equal(contracts.isPlaylist({id:'p',title:'Test',cover:'/cover.svg',trackIds:[],count}),false);});
test('client surfaces HTTP errors, invalid data and cancellation',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>Response.json({ok:false,error:{code:'TEST',message:'Recoverable service error'}},{status:503});await assert.rejects(request('/test',contracts.isCatalog),/Recoverable service error/);
 globalThis.fetch=async()=>Response.json({ok:true,data:{wrong:true}});await assert.rejects(request('/test',contracts.isCatalog),/unexpected data/);
 globalThis.fetch=async()=>Response.json({ok:'true',data:{tracks:[],playlists:[],artists:[]}});await assert.rejects(request('/test',contracts.isSearchResults),/invalid response/);
 globalThis.fetch=async(_url,options)=>{if(options.signal.aborted)throw new DOMException('Cancelled','AbortError');return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));};const controller=new AbortController();const pending=request('/test',contracts.isCatalog,controller.signal);controller.abort();await assert.rejects(pending,{name:'AbortError'});
 }finally{globalThis.fetch=original;}
});
