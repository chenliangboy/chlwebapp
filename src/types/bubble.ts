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

export type BubbleCategory = 'friend' | 'game' | 'agent' | 'ai-chat' | 'tool' | 'note' | string;

export type BubbleActionKind = 'open-panel' | 'open-url' | 'run-command' | 'custom';

export type BubblePanelType = 'chat' | 'game' | 'agent-tool' | 'ai-chat' | 'web' | 'detail' | string;

export interface BubbleAction {
  kind: BubbleActionKind;
  panel?: BubblePanelType;
  url?: string;
  target?: 'workspace' | 'new-tab' | 'same-tab';
  command?: string;
  payload?: Record<string, unknown>;
}

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
  subtitle?: string;
  category?: BubbleCategory;
  tags?: string[];
  pinned?: boolean;
  enabled?: boolean;
  action?: BubbleAction;
  meta?: Record<string, unknown>;
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
  setFreeMotionMode(mode: 'still' | 'float'): void;
  search(value: string): void;
}
