import { Bubble } from './Bubble.js';
import { gridPositions } from './layout.js';
import { resolveCollisions } from './physics.js';
import { clamp, randomBetween } from '../utils/math.js';

function normalizeSearch(value) {
  return value.trim().toLocaleLowerCase();
}

const STORAGE_KEY = 'floating-image-bubbles:positions:v1';

function readStoredPositions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export class BubbleWall {
  constructor({ layer, items = [], onBubbleOpen = () => {} }) {
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

  setVisible(isVisible) {
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

    const nextPositions = {};
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

  updateBubble(id, data) {
    const bubble = this.bubbles.find((item) => item.id === id);
    if (!bubble) return null;
    bubble.update(data);
    this.savePositions(true);
    if (this.layoutMode === 'grid') this.applyGridTargets();
    this.search(this.searchQuery);
    return bubble;
  }

  removeBubble(id) {
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

  openBubble(item) {
    this.onBubbleOpen(item);
  }

  applyGridTargets() {
    const rect = this.getLayerRect();
    const positions = gridPositions(this.bubbles, rect);
    this.bubbles.forEach((item, index) => {
      item.setGridTarget(positions[index]);
    });
  }

  setLayoutMode(mode) {
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
      return;
    }
  }

  captureFreePositions() {
    const nextPositions = {};
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

  handleBubbleHover(item, isHovering) {
    if (isHovering) {
      item.paused = true;
      return;
    }

    if (!item.dragging && this.layoutMode !== 'grid' && !this.isReturningToFree && !item.node.classList.contains('is-search-match')) {
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

  moveDrag(event) {
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

  stopDrag(event) {
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
