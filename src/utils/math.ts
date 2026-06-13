export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
