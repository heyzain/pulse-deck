import {isCatalog,isSearchResults,isPlaylistDetail,isLikeResult,type LikeOperation} from './contracts';
export async function request<T>(url:string,validate:(data:unknown)=>data is T,signal?:AbortSignal,body?:unknown):Promise<T>{
 const controller=new AbortController();const onAbort=()=>controller.abort(signal?.reason);signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted)controller.abort(signal.reason);
 const timer=setTimeout(()=>controller.abort(new DOMException('The request timed out. Please try again.','TimeoutError')),10000);
 try{const response=await fetch(url,{method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,headers:body?{'Content-Type':'application/json'}:undefined,signal:controller.signal,cache:'no-store'});const payload:unknown=await response.json();if(typeof payload!=='object'||payload===null||!('ok'in payload))throw new Error('The music service returned an invalid response.');
 if(typeof payload.ok!=='boolean')throw new Error('The music service returned an invalid response.');
 if(!response.ok||!payload.ok){const err='error'in payload?payload.error:undefined;throw new Error(typeof err==='object'&&err!==null&&'message'in err&&typeof err.message==='string'?err.message:'Music request failed. Please try again.');}
 if(!('data'in payload)||!validate(payload.data))throw new Error('The music service returned unexpected data.');return payload.data;
 }catch(e){if(controller.signal.aborted&&!signal?.aborted)throw new Error('The request timed out. Please try again.');throw e;}finally{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);}
}
export const musicApi={catalog:(signal?:AbortSignal)=>request('/api/music?resource=catalog',isCatalog,signal),search:(q:string,signal?:AbortSignal)=>request(`/api/music?resource=search&q=${encodeURIComponent(q)}`,isSearchResults,signal),playlist:(id:string,signal?:AbortSignal)=>request(`/api/music?resource=playlist&id=${encodeURIComponent(id)}`,isPlaylistDetail,signal),like:(op:LikeOperation,signal?:AbortSignal)=>request('/api/music',isLikeResult,signal,op)};
