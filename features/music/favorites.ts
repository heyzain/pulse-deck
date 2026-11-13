import type {LikeOperation,LikeResult} from './contracts';

// Update the original track immediately; failed writes restore only that track.
export async function saveFavorite(
  operation: LikeOperation,
  previous: boolean,
  apply: (trackId: string, liked: boolean) => void,
  persist: (operation: LikeOperation, signal: AbortSignal) => Promise<LikeResult>,
  signal: AbortSignal,
) {
  if(signal.aborted)return;
  apply(operation.trackId,operation.liked);
  try {
    const result=await persist(operation,signal);
    if(signal.aborted)return;
    if(result.trackId!==operation.trackId)throw new Error('The favorite response did not match this track. Please try again.');
    apply(operation.trackId,result.liked);
  } catch(error) {
    if(!signal.aborted)apply(operation.trackId,previous);
    throw error;
  }
}
