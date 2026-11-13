import {getCatalog,getPlaylist,searchMusic,delayResponse} from '@/features/music/server/data-source';
import {isLikeOperation,type Envelope} from '@/features/music/contracts';
const error=(code:string,message:string,status:number)=>Response.json({ok:false,error:{code,message}} satisfies Envelope<never>,{status,headers:{'Cache-Control':'no-store'}});
const success=<T,>(data:T)=>Response.json({ok:true,data} satisfies Envelope<T>,{headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;const resource=params.get('resource')??'catalog';
 if(!['catalog','search','playlist'].includes(resource))return error('INVALID_RESOURCE','Unknown music resource.',400);
 const query=params.get('q')??'';if(query.length>120)return error('INVALID_QUERY','Search must be 120 characters or fewer.',400);
 const id=params.get('id');if(resource==='playlist'&&(!id||!/^[-a-z0-9]{1,64}$/.test(id)))return error('INVALID_ID','A valid playlist id is required.',400);
 try{await delayResponse(request.signal);}catch{return error('CANCELLED','Request cancelled.',499);}
 if(process.env.MUSIC_SCENARIO==='error')return error('DEMO_ERROR','Your music could not be loaded. Please try again.',503);
 const empty=process.env.MUSIC_SCENARIO==='empty';
 if(resource==='search')return success(searchMusic(query,empty));
 if(resource==='playlist'){const detail=getPlaylist(id!,empty);return detail?success(detail):error('NOT_FOUND','Playlist not found.',404);}
 return success(getCatalog(empty));
}
export async function POST(request:Request){
 let body:unknown;try{body=await request.json();}catch{return error('INVALID_JSON','A JSON preference operation is required.',400);}
 if(!isLikeOperation(body))return error('INVALID_OPERATION','Provide trackId and a liked boolean.',400);
 if(!getCatalog().tracks.some(t=>t.id===body.trackId))return error('NOT_FOUND','Track not found.',404);
 try{await delayResponse(request.signal);}catch{return error('CANCELLED','Request cancelled.',499);}
 if(process.env.MUSIC_SCENARIO==='error')return error('DEMO_ERROR','Could not update this favorite. Please try again.',503);
 return success({...body,persisted:false as const});
}
