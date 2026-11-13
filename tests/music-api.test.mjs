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
for(const name of ['contracts','api-client','queue']){const source=await readFile(path.join(root,'features/music',`${name}.ts`),'utf8');await writeFile(path.join(compiled,`${name}.js`),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);}
const contracts=require(path.join(compiled,'contracts.js'));
const {request}=require(path.join(compiled,'api-client.js'));
const {upcomingTracks}=require(path.join(compiled,'queue.js'));
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:3000';

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
 const response=await fetch(`${base}/api/music?resource=catalog`);assert.equal(response.status,200);const catalog=await response.json();assert.equal(catalog.ok,true);assert.ok(contracts.isCatalog(catalog.data));assert.equal(catalog.data.tracks[0].title,'The Suffering');
 const [search,detail]=await Promise.all([fetch(`${base}/api/music?resource=search&q=Eren`).then(r=>r.json()),fetch(`${base}/api/music?resource=playlist&id=eren`).then(r=>r.json())]);assert.ok(contracts.isSearchResults(search.data));assert.ok(search.data.tracks.every(t=>t.artist==='Eren'));assert.ok(contracts.isPlaylistDetail(detail.data));assert.ok(detail.data.tracks.every(t=>detail.data.playlist.trackIds.includes(t.id)));
});
test('unknown searches return predictable empty lists',async()=>{const response=await fetch(`${base}/api/music?resource=search&q=zzzz-no-match`);const result=await response.json();assert.deepEqual(result.data,{tracks:[],playlists:[],artists:[]});});
test('HTTP rejects invalid resources, identifiers, JSON and favorite operations',async()=>{
 const requests=[['?resource=unknown',{},400],['?resource=playlist&id=../invalid',{},400],['?resource=playlist&id=missing',{},404],['?resource=search&q='+('a'.repeat(121)),{},400],['',{method:'POST',body:'bad'},400],['',{method:'POST',body:JSON.stringify({trackId:'suffering',liked:'yes'})},400],['',{method:'POST',body:JSON.stringify({trackId:'absent',liked:true})},404]];
 await Promise.all(requests.map(async([suffix,init,status])=>{const response=await fetch(`${base}/api/music${suffix}`,init);assert.equal(response.status,status);const body=await response.json();assert.equal(body.ok,false);assert.equal(typeof body.error.code,'string');}));
});
test('desired-state favorite acknowledgements are repeatable and do not mutate seed',async()=>{
 const before=await fetch(`${base}/api/music`).then(r=>r.json());const op={trackId:'suffering',liked:true};
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
