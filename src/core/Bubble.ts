import { imageFor } from './artwork';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { clamp, randomBetween } from '@/utils/math';
import { normalizeItem } from '@/utils/normalizeItem';
import type { BubbleInput, BubbleItem } from '@/types/bubble';
import type { Point } from './layout';

export interface SavedBubbleState extends Point {
  vx: number;
  vy: number;
  size: number;
}

export interface BubbleOptions {
  layer: HTMLElement;
  getLayerRect: () => DOMRect;
  getInitialPosition: (rect: DOMRect, size: number) => Point;
  getSavedState: (id: string) => SavedBubbleState | undefined;
  onPointerDown: (event: PointerEvent, item: Bubble) => void;
  onHoverChange: (item: Bubble, isHovering: boolean) => void;
  onOpen: (item: Bubble) => void;
}

export type SearchState = 'match' | 'miss';

function randomSize() {
  if (window.matchMedia('(max-width: 560px)').matches) return randomBetween(44, 64);
  if (window.matchMedia('(max-width: 900px)').matches) return randomBetween(48, 72);
  return randomBetween(52, 84);
}

export class Bubble {
  item: BubbleItem;
  id: string;
  label: string;
  color: string;
  pale: string;
  type: string;
  image: string;
  node: HTMLDivElement;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  paused: boolean;
  dragging: boolean;

  constructor(data: BubbleInput, index: number, options: BubbleOptions) {
    const { id, label, color, pale, type, image } = normalizeItem(data);
    const {
      layer,
      getLayerRect,
      getInitialPosition,
      onPointerDown,
      onHoverChange,
      onOpen,
      getSavedState
    } = options;

    const objectData = Array.isArray(data) ? {} : data;
    this.item = { ...objectData, id, title: label, label, color, pale, type, image };
    this.id = id;
    this.label = label;
    this.color = color;
    this.pale = pale;
    this.type = type;
    this.image = image;
    this.node = document.createElement('div');
    this.node.className = 'bubble';
    this.node.classList.toggle('has-image', Boolean(image));
    this.applyMetadata();
    const savedState = getSavedState(id);
    this.node.style.setProperty('--size', `${savedState?.size || randomSize()}px`);
    this.node.style.zIndex = String(index + 1);
    const definition = getBubbleTypeDefinition(this.item.category);
    const subtitle = this.item.subtitle || definition.label;
    this.node.innerHTML = `
      <div class="bubble-visual">
        <img src="${imageFor(label, color, pale, image)}" alt="${label}" draggable="false" />
      </div>
      <div class="bubble-hover-card">
        <strong>${label}</strong>
        <small>${subtitle}</small>
        <em>${definition.label}</em>
      </div>
    `;

    layer.appendChild(this.node);

    const rect = getLayerRect();
    this.size = parseFloat(this.node.style.getPropertyValue('--size'));
    const position = savedState && rect.width > 0 && rect.height > 0
      ? {
        x: clamp(savedState.x, 0, Math.max(0, rect.width - this.size)),
        y: clamp(savedState.y, 0, Math.max(0, rect.height - this.size))
      }
      : getInitialPosition(rect, this.size);
    this.x = position.x;
    this.y = position.y;
    this.vx = savedState?.vx ?? (randomBetween(-0.16, 0.16) || 0.12);
    this.vy = savedState?.vy ?? (randomBetween(-0.16, 0.16) || -0.12);
    this.targetX = position.x;
    this.targetY = position.y;
    this.paused = false;
    this.dragging = false;

    this.node.addEventListener('pointerenter', () => {
      onHoverChange(this, true);
    });
    this.node.addEventListener('pointerleave', () => {
      onHoverChange(this, false);
    });
    this.node.addEventListener('pointerdown', (event) => onPointerDown(event, this));
    this.node.addEventListener('dblclick', (event) => {
      event.preventDefault();
      onOpen(this);
    });
    this.render();
  }

  applyMetadata() {
    const definition = getBubbleTypeDefinition(this.item.category);
    this.node.dataset.category = definition.id;
    this.node.style.setProperty('--category-color', definition.defaultColor);
    this.node.style.setProperty('--category-pale', definition.defaultPale);
  }

  update(data: BubbleInput) {
    const { id, label, color, pale, type, image } = normalizeItem({ ...this.item, ...(Array.isArray(data) ? {} : data) });
    this.item = { ...this.item, ...(Array.isArray(data) ? {} : data), id, title: label, label, color, pale, type, image };
    this.id = id;
    this.label = label;
    this.color = color;
    this.pale = pale;
    this.type = type;
    this.image = image;
    this.node.classList.toggle('has-image', Boolean(image));
    this.applyMetadata();
    const imageNode = this.node.querySelector('img');
    const labelNode = this.node.querySelector('.bubble-hover-card strong');
    const subtitleNode = this.node.querySelector('.bubble-hover-card small');
    const categoryNode = this.node.querySelector('.bubble-hover-card em');
    const definition = getBubbleTypeDefinition(this.item.category);
    if (imageNode) {
      imageNode.src = imageFor(label, color, pale, image);
      imageNode.alt = label;
    }
    if (labelNode) labelNode.textContent = label;
    if (subtitleNode) subtitleNode.textContent = this.item.subtitle || definition.label;
    if (categoryNode) categoryNode.textContent = definition.label;
  }

  destroy() {
    this.node.remove();
  }

  setSearchState(state: SearchState) {
    this.node.classList.toggle('is-search-match', state === 'match');
    this.node.classList.toggle('is-search-miss', state === 'miss');
    if (state === 'match') this.paused = true;
  }

  clearSearchState(canResume: boolean) {
    this.node.classList.remove('is-search-match', 'is-search-miss');
    if (!this.dragging && canResume) this.paused = false;
  }

  setGridTarget(position: Point) {
    this.targetX = position.x;
    this.targetY = position.y;
    this.paused = true;
  }

  setReturnTarget(position: Point) {
    this.targetX = position.x;
    this.targetY = position.y;
    this.paused = true;
  }

  isNearTarget(threshold = 1.4) {
    return Math.hypot(this.targetX - this.x, this.targetY - this.y) <= threshold;
  }

  resumeFloating() {
    this.paused = false;
    this.vx = this.vx || randomBetween(-0.14, 0.14) || 0.1;
    this.vy = this.vy || randomBetween(-0.14, 0.14) || -0.1;
  }

  moveToGridTarget() {
    this.x += (this.targetX - this.x) * 0.08;
    this.y += (this.targetY - this.y) * 0.08;
  }

  float(bounds: DOMRect) {
    if (this.paused || this.dragging) return;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= bounds.width - this.size) this.vx *= -1;
    if (this.y <= 0 || this.y >= bounds.height - this.size) this.vy *= -1;

    this.keepInside(bounds);
  }

  keepInside(bounds: DOMRect) {
    this.x = clamp(this.x, 0, Math.max(0, bounds.width - this.size));
    this.y = clamp(this.y, 0, Math.max(0, bounds.height - this.size));
  }

  refreshSize(bounds: DOMRect) {
    this.size = this.node.getBoundingClientRect().width;
    this.keepInside(bounds);
  }

  clampVelocity(limit = 0.2) {
    this.vx = clamp(this.vx, -limit, limit);
    this.vy = clamp(this.vy, -limit, limit);
  }

  render() {
    this.node.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }
}
