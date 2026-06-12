import { Bubble } from './Bubble.js';
import { gridPositions } from './layout.js';
import { resolveCollisions } from './physics.js';
import { clamp, randomBetween } from '../utils/math.js';

function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase();
}

export class BubbleWall {
  constructor({ layer, items = [] }) {
    this.layer = layer;
    this.bubbles = [];
    this.layoutMode = 'free';
    this.searchQuery = '';
    this.layoutModeListeners = new Set();
    this.pointer = {
      id: null,
      item: null,
      offsetX: 0,
      offsetY: 0
    };

    this.moveDrag = this.moveDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.keepInside = this.keepInside.bind(this);
    this.animate = this.animate.bind(this);

    items.forEach((item) => this.addBubble(item));
    this.bindWindowEvents();
    requestAnimationFrame(this.animate);
  }

  getLayerRect() {
    return this.layer.getBoundingClientRect();
  }

  onLayoutModeChange(listener) {
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

  overlapsExisting(x, y, size) {
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

  initialPosition(rect, size) {
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

  addBubble(data) {
    const bubble = new Bubble(data, this.bubbles.length, {
      layer: this.layer,
      getLayerRect: () => this.getLayerRect(),
      getInitialPosition: (rect, size) => this.initialPosition(rect, size),
      onPointerDown: (event, item) => this.startDrag(event, item),
      onHoverChange: (item, isHovering) => this.handleBubbleHover(item, isHovering)
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

  applyGridTargets() {
    const rect = this.getLayerRect();
    const positions = gridPositions(this.bubbles, rect);
    this.bubbles.forEach((item, index) => {
      item.setGridTarget(positions[index]);
    });
  }

  setLayoutMode(mode) {
    this.layoutMode = mode;
    document.body.classList.toggle('is-grid-mode', mode === 'grid');
    this.emitLayoutModeChange();

    if (mode === 'grid') {
      this.applyGridTargets();
      return;
    }

    for (const item of this.bubbles) {
      item.resumeFloating();
    }

    this.search(this.searchQuery);
  }

  handleBubbleHover(item, isHovering) {
    if (isHovering) {
      item.paused = true;
      return;
    }

    if (!item.dragging && this.layoutMode !== 'grid' && !item.node.classList.contains('is-search-match')) {
      item.paused = false;
    }
  }

  search(value) {
    this.searchQuery = normalizeSearch(value);
    document.body.classList.toggle('is-searching', this.searchQuery.length > 0);

    for (const item of this.bubbles) {
      if (!this.searchQuery) {
        item.clearSearchState(this.layoutMode !== 'grid');
        continue;
      }

      const label = item.label.toLocaleLowerCase();
      item.setSearchState(label.includes(this.searchQuery) ? 'match' : 'miss');
    }
  }

  startDrag(event, item) {
    if (this.layoutMode === 'grid') return;

    const rect = this.getLayerRect();
    this.pointer.id = event.pointerId;
    this.pointer.item = item;
    this.pointer.offsetX = event.clientX - rect.left - item.x;
    this.pointer.offsetY = event.clientY - rect.top - item.y;
    item.dragging = true;
    item.paused = true;
    item.node.classList.add('is-dragging');
    item.node.setPointerCapture(event.pointerId);
  }

  moveDrag(event) {
    if (this.pointer.item === null || event.pointerId !== this.pointer.id) return;
    const rect = this.getLayerRect();
    const item = this.pointer.item;
    item.x = clamp(event.clientX - rect.left - this.pointer.offsetX, 0, rect.width - item.size);
    item.y = clamp(event.clientY - rect.top - this.pointer.offsetY, 0, rect.height - item.size);
  }

  stopDrag(event) {
    if (this.pointer.item === null || event.pointerId !== this.pointer.id) return;
    const item = this.pointer.item;
    item.dragging = false;
    item.paused = this.layoutMode === 'grid' || item.node.classList.contains('is-search-match');
    item.node.classList.remove('is-dragging');
    this.pointer.id = null;
    this.pointer.item = null;
  }

  animate() {
    const rect = this.getLayerRect();

    if (this.layoutMode === 'grid') {
      for (const item of this.bubbles) {
        item.moveToGridTarget();
        item.render();
      }

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

    requestAnimationFrame(this.animate);
  }

  keepInside() {
    const rect = this.getLayerRect();
    for (const item of this.bubbles) {
      item.refreshSize(rect);
    }

    if (this.layoutMode === 'grid') this.applyGridTargets();
  }
}
