import { imageFor } from './artwork.js';
import { clamp, randomBetween } from '../utils/math.js';
import { normalizeItem } from '../utils/normalizeItem.js';

function randomSize() {
  if (window.matchMedia('(max-width: 560px)').matches) return randomBetween(44, 64);
  if (window.matchMedia('(max-width: 900px)').matches) return randomBetween(48, 72);
  return randomBetween(52, 84);
}

export class Bubble {
  constructor(data, index, options) {
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

    this.item = { ...data, id, title: label, label, color, pale, type, image };
    this.id = id;
    this.label = label;
    this.color = color;
    this.pale = pale;
    this.type = type;
    this.image = image;
    this.node = document.createElement('div');
    this.node.className = 'bubble';
    this.node.classList.toggle('has-image', Boolean(image));
    const savedState = getSavedState(id);
    this.node.style.setProperty('--size', `${savedState?.size || randomSize()}px`);
    this.node.style.zIndex = String(index + 1);
    this.node.innerHTML = `
      <div class="bubble-visual">
        <img src="${imageFor(label, color, pale, image)}" alt="${label}" draggable="false" />
      </div>
      <span>${label}</span>
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

  update(data) {
    const { id, label, color, pale, type, image } = normalizeItem({ ...this.item, ...data });
    this.item = { ...this.item, ...data, id, title: label, label, color, pale, type, image };
    this.id = id;
    this.label = label;
    this.color = color;
    this.pale = pale;
    this.type = type;
    this.image = image;
    this.node.classList.toggle('has-image', Boolean(image));
    this.node.querySelector('img').src = imageFor(label, color, pale, image);
    this.node.querySelector('img').alt = label;
    this.node.querySelector('span').textContent = label;
  }

  destroy() {
    this.node.remove();
  }

  setSearchState(state) {
    this.node.classList.toggle('is-search-match', state === 'match');
    this.node.classList.toggle('is-search-miss', state === 'miss');
    if (state === 'match') this.paused = true;
  }

  clearSearchState(canResume) {
    this.node.classList.remove('is-search-match', 'is-search-miss');
    if (!this.dragging && canResume) this.paused = false;
  }

  setGridTarget(position) {
    this.targetX = position.x;
    this.targetY = position.y;
    this.paused = true;
  }

  setReturnTarget(position) {
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

  float(bounds) {
    if (this.paused || this.dragging) return;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= bounds.width - this.size) this.vx *= -1;
    if (this.y <= 0 || this.y >= bounds.height - this.size) this.vy *= -1;

    this.keepInside(bounds);
  }

  keepInside(bounds) {
    this.x = clamp(this.x, 0, Math.max(0, bounds.width - this.size));
    this.y = clamp(this.y, 0, Math.max(0, bounds.height - this.size));
  }

  refreshSize(bounds) {
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
