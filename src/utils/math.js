export function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
