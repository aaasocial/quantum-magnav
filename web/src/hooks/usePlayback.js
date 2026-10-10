// One playback store for the whole page; components subscribe to just what they draw.
import { useSyncExternalStore } from 'react';
import { createPlaybackStore } from '../lib/playback.js';

export const playback = createPlaybackStore();

export function usePlaybackIndex() {
  return useSyncExternalStore(playback.subscribe, playback.getIndex);
}

export function usePlaybackTime() {
  return useSyncExternalStore(playback.subscribe, playback.getTime);
}

export function usePlaybackPlaying() {
  return useSyncExternalStore(playback.subscribe, playback.isPlaying);
}
