export type BubbleType =
  | 'spark'
  | 'sun'
  | 'mountain'
  | 'flower'
  | 'wave'
  | 'note'
  | 'film'
  | 'star'
  | 'book'
  | string;

export interface BubbleItem {
  id: string;
  title: string;
  label?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  img?: string;
  src?: string;
  color: string;
  pale: string;
  lightColor?: string;
  backgroundColor?: string;
  type: BubbleType;
}

export type BubbleInput =
  | Partial<BubbleItem>
  | [label: string, color?: string, pale?: string, type?: BubbleType, image?: string];

export interface ProfileDetail {
  id: string;
  name: string;
  intro: string;
  description: string;
  tags: string[];
  actions: string[];
  logo?: string;
  color?: string;
  pale?: string;
  type?: BubbleType;
}

export interface BubbleEngineItem {
  id: string;
  item: BubbleItem;
}

export interface BubbleEngine {
  id: string;
  item: BubbleItem;
  label: string;
}

export interface BubbleWallPublicApi {
  addBubble(data: BubbleInput): BubbleEngine;
  updateBubble(id: string, data: BubbleInput): BubbleEngine | null;
  removeBubble(id: string): boolean;
  getBubbles(): BubbleEngine[];
  setLayoutMode(mode: 'free' | 'grid'): void;
  search(value: string): void;
}
