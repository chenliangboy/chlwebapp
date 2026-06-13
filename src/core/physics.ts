import type { Bubble } from './Bubble';

export function resolveCollisions(bubbles: Bubble[], bounds: DOMRect) {
  const padding = 8;

  for (let i = 0; i < bubbles.length; i += 1) {
    for (let j = i + 1; j < bubbles.length; j += 1) {
      const a = bubbles[i];
      const b = bubbles[j];
      const ar = a.size / 2;
      const br = b.size / 2;
      const ax = a.x + ar;
      const ay = a.y + ar;
      const bx = b.x + br;
      const by = b.y + br;
      const dx = bx - ax;
      const dy = by - ay;
      const minDistance = ar + br + padding;
      const distance = Math.hypot(dx, dy) || 0.01;

      if (distance >= minDistance) continue;

      const overlap = (minDistance - distance) / 2;
      const nx = dx / distance;
      const ny = dy / distance;

      if (!a.dragging) {
        a.x -= nx * overlap;
        a.y -= ny * overlap;
      }

      if (!b.dragging) {
        b.x += nx * overlap;
        b.y += ny * overlap;
      }

      if (!a.dragging && !a.paused) {
        a.vx -= nx * 0.025;
        a.vy -= ny * 0.025;
      }

      if (!b.dragging && !b.paused) {
        b.vx += nx * 0.025;
        b.vy += ny * 0.025;
      }
    }
  }

  for (const item of bubbles) {
    item.keepInside(bounds);
    item.clampVelocity();
  }
}
