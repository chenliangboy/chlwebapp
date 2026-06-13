import { clamp } from '@/utils/math';
import type { Bubble } from './Bubble';

export interface Point {
  x: number;
  y: number;
}

export function gridPositions(bubbles: Bubble[], rect: DOMRect): Point[] {
  const topReserve = window.matchMedia('(max-width: 560px)').matches ? 76 : 88;
  const sideGap = window.matchMedia('(max-width: 560px)').matches ? 18 : 36;
  const largest = Math.max(...bubbles.map((item) => item.size), 64);
  const cell = Math.max(largest + 22, window.matchMedia('(max-width: 560px)').matches ? 72 : 92);
  const availableWidth = Math.max(cell, rect.width - sideGap * 2);
  const cols = Math.max(1, Math.floor(availableWidth / cell));
  const rows = Math.ceil(bubbles.length / cols);
  const gridWidth = cols * cell;
  const gridHeight = rows * cell;
  const startX = Math.max(sideGap, (rect.width - gridWidth) / 2 + cell / 2);
  const startY = Math.max(topReserve, (rect.height - gridHeight) / 2 + cell / 2);

  return bubbles.map((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * cell - item.size / 2;
    const y = startY + row * cell - item.size / 2;

    return {
      x: clamp(x, 0, Math.max(0, rect.width - item.size)),
      y: clamp(y, 0, Math.max(0, rect.height - item.size))
    };
  });
}
