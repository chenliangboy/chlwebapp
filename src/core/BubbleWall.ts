import { Bubble, type SavedBubbleState } from './Bubble';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { gridPositions, type Point } from './layout';
import { resolveCollisions } from './physics';
import { clamp, randomBetween } from '@/utils/math';
import type { BubbleInput } from '@/types/bubble';

export type LayoutMode = 'free' | 'grid';

interface BubbleWallOptions {
  layer: HTMLElement;
  items?: BubbleInput[];
  onBubbleOpen?: (bubble: Bubble) => void;
}

interface DragPointer {
  id: number | null;
  item: Bubble | null;
  offsetX: number;
  offsetY: number;
  startClientX: number;
  startClientY: number;
  startedAt: number;
  moved: boolean;
}

type SavedPositions = Record<string, SavedBubbleState>;

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase();
}

function searchableText(item: Bubble) {
  const bubbleItem = item.item;
  const category = getBubbleTypeDefinition(bubbleItem.category);
  const tags = bubbleItem.tags || [];
  const metaValues = bubbleItem.meta ? Object.values(bubbleItem.meta) : [];

  return [
    item.label,
    bubbleItem.title,
    bubbleItem.subtitle,
    bubbleItem.category,
    category.label,
    ...tags,
    ...metaValues.map((value) => String(value))
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
}

const STORAGE_KEY = 'floating-image-bubbles:positions:v1';

function isSavedBubbleState(value: unknown): value is SavedBubbleState {
  if (!value || typeof value !== 'object') return false;
  const state = value as SavedBubbleState;
  return ['x', 'y', 'vx', 'vy', 'size'].every((key) => typeof state[key as keyof SavedBubbleState] === 'number');
}

function readStoredPositions(): SavedPositions {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, unknown>;
    return Object.fromEntries(Object.entries(raw).filter(([, value]) => isSavedBubbleState(value))) as SavedPositions;
  } catch {
    return {};
  }
}

export class BubbleWall {
  layer: HTMLElement;
  bubbles: Bubble[];
  layoutMode: LayoutMode;
  searchQuery: string;
  onBubbleOpen: (bubble: Bubble) => void;
  isVisible: boolean;
  isReturningToFree: boolean;
  savedPositions: SavedPositions;
  freePositions: SavedPositions;
  lastPositionSave: number;
  layoutModeListeners: Set<(mode: LayoutMode) => void>;
  pointer: DragPointer;
  destroyed: boolean;

  constructor({ layer, items = [], onBubbleOpen = () => {} }: BubbleWallOptions) {
    this.layer = layer;
    this.bubbles = [];
    this.layoutMode = 'free';
    this.searchQuery = '';
    this.onBubbleOpen = onBubbleOpen;
    this.isVisible = true;
    this.isReturningToFree = false;
    this.savedPositions = readStoredPositions();
    this.freePositions = { ...this.savedPositions };
    this.lastPositionSave = 0;
    this.layoutModeListeners = new Set();
    this.pointer = {
      id: null,
      item: null,
      offsetX: 0,
      offsetY: 0,
      startClientX: 0,
      startClientY: 0,
      startedAt: 0,
      moved: false
    };

    this.moveDrag = this.moveDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.keepInside = this.keepInside.bind(this);
    this.animate = this.animate.bind(this);
    this.destroyed = false;

    items.forEach((item) => this.addBubble(item));
    this.bindWindowEvents();
    requestAnimationFrame(this.animate);
  }

  getLayerRect() {
    return this.layer.getBoundingClientRect();
  }

  onLayoutModeChange(listener: (mode: LayoutMode) => void) {
    this.layoutModeListeners.add(listener);
    listener(this.layoutMode);
    return () => this.layoutModeListeners.delete(listener);
  }

  emitLayoutModeChange() {
    for (const listener of this.layoutModeListeners) {
      listener(this.layoutMode);
    }
  }

  bindWindowEvents() {
    window.addEventListener('pointermove', this.moveDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);
    window.addEventListener('resize', this.keepInside);
  }

  destroy() {
    this.destroyed = true;
    window.removeEventListener('pointermove', this.moveDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);
    window.removeEventListener('resize', this.keepInside);
    this.savePositions(true);
    this.bubbles.forEach((item) => item.destroy());
    this.bubbles = [];
  }

  overlapsExisting(x: number, y: number, size: number) {
    const padding = 8;
    const radius = size / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    return this.bubbles.some((item) => {
      const otherRadius = item.size / 2;
      const dx = centerX - (item.x + otherRadius);
      const dy = centerY - (item.y + otherRadius);
      const minDistance = radius + otherRadius + padding;
      return dx * dx + dy * dy < minDistance * minDistance;
    });
  }

  initialPosition(rect: DOMRect, size: number): Point {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const x = randomBetween(0, Math.max(0, rect.width - size));
      const y = randomBetween(0, Math.max(0, rect.height - size));
      if (!this.overlapsExisting(x, y, size)) return { x, y };
    }

    return {
      x: randomBetween(0, Math.max(0, rect.width - size)),
      y: randomBetween(0, Math.max(0, rect.height - size))
    };
  }

  addBubble(data: BubbleInput) {
    const bubble = new Bubble(data, this.bubbles.length, {
      layer: this.layer,
      getLayerRect: () => this.getLayerRect(),
      getInitialPosition: (rect, size) => this.initialPosition(rect, size),
      getSavedState: (id) => this.savedPositions[id],
      onPointerDown: (event, item) => this.startDrag(event, item),
      onHoverChange: (item, isHovering) => this.handleBubbleHover(item, isHovering),
      onOpen: (item) => this.openBubble(item)
    });

    this.bubbles.push(bubble);

    if (this.layoutMode === 'grid') {
      this.applyGridTargets();
    }

    this.search(this.searchQuery);
    return bubble;
  }

  getBubbles() {
    return [...this.bubbles];
  }

  setVisible(isVisible: boolean) {
    this.isVisible = isVisible;
    if (isVisible) {
      this.keepInside();
      this.search(this.searchQuery);
    } else {
      this.savePositions(true);
    }
  }

  savePositions(force = false) {
    if (this.layoutMode !== 'free') return;
    const now = performance.now();
    if (!force && now - this.lastPositionSave < 500) return;
    this.lastPositionSave = now;

    const nextPositions: SavedPositions = {};
    for (const item of this.bubbles) {
      nextPositions[item.id] = {
        x: Math.round(item.x),
        y: Math.round(item.y),
        vx: Number(item.vx.toFixed(4)),
        vy: Number(item.vy.toFixed(4)),
        size: Math.round(item.size)
      };
    }

    this.savedPositions = nextPositions;
    this.freePositions = { ...nextPositions };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPositions));
    } catch {
      // localStorage can be unavailable in private or restricted contexts.
    }
  }

  updateBubble(id: string, data: BubbleInput) {
    const bubble = this.bubbles.find((item) => item.id === id);
    if (!bubble) return null;
    bubble.update(data);
    this.savePositions(true);
    if (this.layoutMode === 'grid') this.applyGridTargets();
    this.search(this.searchQuery);
    return bubble;
  }

  removeBubble(id: string) {
    const index = this.bubbles.findIndex((item) => item.id === id);
    if (index === -1) return false;
    const [bubble] = this.bubbles.splice(index, 1);
    bubble.destroy();
    delete this.savedPositions[id];
    delete this.freePositions[id];
    this.bubbles.forEach((item, itemIndex) => {
      item.node.style.zIndex = String(itemIndex + 1);
    });
    this.savePositions(true);
    if (this.layoutMode === 'grid') this.applyGridTargets();
    this.search(this.searchQuery);
    return true;
  }

  openBubble(item: Bubble) {
    this.onBubbleOpen(item);
  }

  applyGridTargets() {
    const rect = this.getLayerRect();
    const positions = gridPositions(this.bubbles, rect);
    this.bubbles.forEach((item, index) => {
      item.setGridTarget(positions[index]);
    });
  }

  setLayoutMode(mode: LayoutMode) {
    if (mode === this.layoutMode) return;
    if (mode === 'grid') {
      this.savePositions(true);
      this.captureFreePositions();
    }

    this.layoutMode = mode;
    document.body.classList.toggle('is-grid-mode', mode === 'grid');
    this.emitLayoutModeChange();

    if (mode === 'grid') {
      this.applyGridTargets();
      return;
    }

    if (mode === 'free') {
      this.startReturnToFreePositions();
    }
  }

  captureFreePositions() {
    const nextPositions: SavedPositions = {};
    for (const item of this.bubbles) {
      nextPositions[item.id] = {
        x: Math.round(item.x),
        y: Math.round(item.y),
        vx: Number(item.vx.toFixed(4)),
        vy: Number(item.vy.toFixed(4)),
        size: Math.round(item.size)
      };
    }

    this.freePositions = nextPositions;
    this.savedPositions = nextPositions;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPositions));
    } catch {
      // localStorage can be unavailable in private or restricted contexts.
    }
  }

  startReturnToFreePositions() {
    const rect = this.getLayerRect();
    this.isReturningToFree = true;
    document.body.classList.add('is-returning-free');
    for (const item of this.bubbles) {
      const saved = this.freePositions[item.id] || this.savedPositions[item.id];
      const target = saved
        ? {
          x: clamp(saved.x, 0, Math.max(0, rect.width - item.size)),
          y: clamp(saved.y, 0, Math.max(0, rect.height - item.size))
        }
        : { x: item.x, y: item.y };
      item.setReturnTarget(target);
    }

    this.search(this.searchQuery);
  }

  finishReturnToFreePositions() {
    this.isReturningToFree = false;
    document.body.classList.remove('is-returning-free');
    for (const item of this.bubbles) {
      item.x = item.targetX;
      item.y = item.targetY;
      item.resumeFloating();
    }
    this.savePositions(true);
  }

  handleBubbleHover(item: Bubble, isHovering: boolean) {
    if (isHovering) {
      item.paused = true;
      return;
    }

    if (!item.dragging && this.layoutMode !== 'grid' && !this.isReturningToFree && !item.node.classList.contains('is-search-match')) {
      item.paused = false;
    }
  }

  search(value: string) {
    this.searchQuery = normalizeSearch(value);
    document.body.classList.toggle('is-searching', this.searchQuery.length > 0);

    for (const item of this.bubbles) {
      if (!this.searchQuery) {
        item.clearSearchState(this.layoutMode !== 'grid');
        continue;
      }

      item.setSearchState(searchableText(item).includes(this.searchQuery) ? 'match' : 'miss');
    }
  }

  startDrag(event: PointerEvent, item: Bubble) {
    if (this.layoutMode === 'grid' || this.isReturningToFree) return;

    const rect = this.getLayerRect();
    this.pointer.id = event.pointerId;
    this.pointer.item = item;
    this.pointer.offsetX = event.clientX - rect.left - item.x;
    this.pointer.offsetY = event.clientY - rect.top - item.y;
    this.pointer.startClientX = event.clientX;
    this.pointer.startClientY = event.clientY;
    this.pointer.startedAt = Date.now();
    this.pointer.moved = false;
    item.dragging = true;
    item.paused = true;
    item.node.classList.add('is-dragging');
    item.node.setPointerCapture(event.pointerId);
  }

  moveDrag(event: PointerEvent) {
    if (this.pointer.item === null || event.pointerId !== this.pointer.id) return;
    const rect = this.getLayerRect();
    const item = this.pointer.item;
    const dx = event.clientX - this.pointer.startClientX;
    const dy = event.clientY - this.pointer.startClientY;
    if (Math.hypot(dx, dy) > 8) this.pointer.moved = true;
    item.x = clamp(event.clientX - rect.left - this.pointer.offsetX, 0, rect.width - item.size);
    item.y = clamp(event.clientY - rect.top - this.pointer.offsetY, 0, rect.height - item.size);
    this.savePositions();
  }

  stopDrag(event: PointerEvent) {
    if (this.pointer.item === null || event.pointerId !== this.pointer.id) return;
    const item = this.pointer.item;
    const wasTap = !this.pointer.moved && Date.now() - this.pointer.startedAt < 450;
    item.dragging = false;
    item.paused = this.layoutMode === 'grid' || item.node.classList.contains('is-search-match');
    item.node.classList.remove('is-dragging');
    this.pointer.id = null;
    this.pointer.item = null;
    this.pointer.moved = false;

    if (wasTap) {
      this.openBubble(item);
    }

    this.savePositions(true);
  }

  animate() {
    if (this.destroyed) return;
    const rect = this.getLayerRect();
    if (!this.isVisible || rect.width === 0 || rect.height === 0) {
      requestAnimationFrame(this.animate);
      return;
    }

    if (this.layoutMode === 'grid') {
      for (const item of this.bubbles) {
        item.moveToGridTarget();
        item.render();
      }

      requestAnimationFrame(this.animate);
      return;
    }

    if (this.isReturningToFree) {
      let allDone = true;
      for (const item of this.bubbles) {
        item.moveToGridTarget();
        item.render();
        if (!item.isNearTarget()) allDone = false;
      }

      if (allDone) this.finishReturnToFreePositions();
      requestAnimationFrame(this.animate);
      return;
    }

    for (const item of this.bubbles) {
      item.float(rect);
    }

    resolveCollisions(this.bubbles, rect);

    for (const item of this.bubbles) {
      item.render();
    }

    this.savePositions();
    requestAnimationFrame(this.animate);
  }

  keepInside() {
    const rect = this.getLayerRect();
    if (rect.width === 0 || rect.height === 0) return;
    for (const item of this.bubbles) {
      item.refreshSize(rect);
    }

    if (this.layoutMode === 'grid') this.applyGridTargets();
    this.savePositions(true);
  }
}
