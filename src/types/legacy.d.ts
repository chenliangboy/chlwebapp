import type { BubbleWallPublicApi } from './bubble';

declare global {
  interface Window {
    bubbleWall?: BubbleWallPublicApi;
  }
}

export {};
