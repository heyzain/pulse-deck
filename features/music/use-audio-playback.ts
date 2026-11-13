'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {AudioEngine} from './audio-engine';
import type {Track} from './contracts';

export function useAudioPlayback(track: Track | undefined, onEnded: () => void) {
  const [engine]=useState(() => new AudioEngine());
  const state=useSyncExternalStore(engine.subscribe,engine.getSnapshot,engine.getServerSnapshot);
  useEffect(() => engine.attach(new Audio()),[engine]);
  useEffect(() => {engine.setEndedHandler(onEnded);},[engine,onEnded]);
  useEffect(() => {if(track)engine.loadTrack(track);},[engine,track]);
  return {...state,loadTrack:engine.loadTrack,setPlaying:engine.setPlaying,setPosition:engine.seek,setVolume:engine.setVolume,retry:engine.retry};
}
