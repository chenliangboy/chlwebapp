import './style.css';

const items = [
  ['晨光', '#ffb86c', '#ffe2a8', 'sun'],
  ['山谷', '#58c4dd', '#d8f5ff', 'mountain'],
  ['花园', '#ff7aa2', '#ffd4e2', 'flower'],
  ['海面', '#4d96ff', '#cbe3ff', 'wave'],
  ['森林', '#3fbd74', '#cbf2d9', 'leaf'],
  ['星空', '#7c5cff', '#ded6ff', 'star'],
  ['咖啡', '#b8794b', '#f2ddc7', 'cup'],
  ['音乐', '#ff6b6b', '#ffd2d2', 'note'],
  ['旅行', '#22b8cf', '#c5f6fa', 'plane'],
  ['阅读', '#845ef7', '#e5dbff', 'book'],
  ['城市', '#6c757d', '#e9ecef', 'city'],
  ['水果', '#f59f00', '#fff3bf', 'fruit'],
  ['雨滴', '#339af0', '#d0ebff', 'drop'],
  ['晚霞', '#f06595', '#ffe0ec', 'cloud'],
  ['绿洲', '#20c997', '#c3fae8', 'tree'],
  ['月亮', '#748ffc', '#dbe4ff', 'moon'],
  ['火焰', '#ff922b', '#ffe8cc', 'fire'],
  ['雪山', '#15aabf', '#e3fafc', 'snow'],
  ['电影', '#495057', '#dee2e6', 'film'],
  ['灵感', '#fcc419', '#fff9db', 'spark']
];

const layer = document.querySelector('#bubbleLayer');
const layoutToggle = document.querySelector('#layoutToggle');
const bubbles = [];
let layoutMode = 'free';
const pointer = {
  id: null,
  item: null,
  offsetX: 0,
  offsetY: 0
};

function iconMarkup(type) {
  const common = 'fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    sun: `<circle cx="100" cy="92" r="28" fill="white" opacity=".95"/><path ${common} d="M100 28v18M100 138v18M36 92H18M182 92h-18M55 47 42 34M145 47l13-13M55 137l-13 13M145 137l13 13"/>`,
    mountain: `<path fill="white" opacity=".95" d="M24 145 77 70l33 43 18-25 48 57H24Z"/><path fill="#ffffff" opacity=".6" d="m77 70 13 17-19 3Z"/>`,
    flower: `<circle cx="100" cy="100" r="17" fill="white"/><g fill="white" opacity=".78"><ellipse cx="100" cy="58" rx="17" ry="32"/><ellipse cx="100" cy="142" rx="17" ry="32"/><ellipse cx="58" cy="100" rx="32" ry="17"/><ellipse cx="142" cy="100" rx="32" ry="17"/></g>`,
    wave: `<path ${common} d="M22 111c22-28 48-28 70 0s48 28 86 0"/><path ${common} opacity=".6" d="M22 139c22-24 48-24 70 0s48 24 86 0"/>`,
    leaf: `<path fill="white" opacity=".9" d="M158 43c-69 1-106 34-107 85 0 22 15 36 37 36 50 0 78-53 70-121Z"/><path ${common} d="M61 149c33-43 62-60 92-83"/>`,
    star: `<path fill="white" opacity=".95" d="m100 28 18 48 51 3-40 32 13 50-42-28-42 28 13-50-40-32 51-3 18-48Z"/>`,
    cup: `<path fill="white" opacity=".95" d="M53 70h82v53a37 37 0 0 1-37 37h-8a37 37 0 0 1-37-37V70Z"/><path ${common} d="M135 84h15a20 20 0 0 1 0 40h-15"/>`,
    note: `<path fill="white" opacity=".95" d="M124 36v78a25 25 0 1 1-15-23V56l48-12v57a25 25 0 1 1-15-23V32l-18 4Z"/>`,
    plane: `<path fill="white" opacity=".95" d="M178 34 28 94l61 20 21 58 68-138Z"/><path ${common} d="m89 114 39-39"/>`,
    book: `<path fill="white" opacity=".95" d="M45 45h47c16 0 24 8 24 24v89c0-14-10-21-24-21H45V45Zm110 0h-39c-16 0-24 8-24 24v89c0-14 10-21 24-21h39V45Z"/>`,
    city: `<path fill="white" opacity=".95" d="M35 154V69h34v85h18V42h45v112h33V88h-33v66H35Z"/><path stroke="#6c757d" stroke-width="8" d="M53 91h0M53 115h0M105 67h0M105 92h0M105 117h0M147 113h0"/>`,
    fruit: `<circle cx="92" cy="109" r="48" fill="white" opacity=".95"/><path fill="white" opacity=".75" d="M117 59c4-25 21-34 44-30-4 27-23 39-44 30Z"/><path ${common} d="M104 61c1-15 8-27 21-35"/>`,
    drop: `<path fill="white" opacity=".95" d="M100 24c39 46 58 78 58 105a58 58 0 1 1-116 0c0-27 19-59 58-105Z"/>`,
    cloud: `<path fill="white" opacity=".92" d="M65 137a34 34 0 0 1 3-68 45 45 0 0 1 86 15 27 27 0 0 1-4 53H65Z"/>`,
    tree: `<path fill="white" opacity=".95" d="M101 29 42 105h37l-27 37h33v28h30v-28h33l-27-37h37L101 29Z"/>`,
    moon: `<path fill="white" opacity=".95" d="M137 159A70 70 0 0 1 81 31a62 62 0 1 0 56 128Z"/>`,
    fire: `<path fill="white" opacity=".95" d="M105 172c-37-9-55-36-48-70 5-23 20-39 43-66 4 25 13 38 28 50 6-14 5-28 0-43 29 22 48 52 42 84-5 29-28 45-65 45Z"/>`,
    snow: `<path ${common} d="M100 30v140M39 65l122 70M39 135l122-70M75 44l25 23 25-23M75 156l25-23 25 23"/>`,
    film: `<rect x="40" y="48" width="120" height="104" rx="12" fill="white" opacity=".95"/><path stroke="#495057" stroke-width="8" d="M68 48v104M132 48v104M40 80h28M132 80h28M40 120h28M132 120h28"/>`,
    spark: `<path fill="white" opacity=".95" d="M101 27 117 82l55 17-55 17-16 55-17-55-55-17 55-17 17-55Z"/><circle cx="156" cy="48" r="11" fill="white" opacity=".75"/><circle cx="49" cy="151" r="9" fill="white" opacity=".7"/>`
  };
  return icons[type] || icons.spark;
}

function imageFor(label, color, pale, type) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="g" cx="32%" cy="24%" r="78%">
          <stop offset="0" stop-color="${pale}" stop-opacity=".88"/>
          <stop offset=".55" stop-color="${color}"/>
          <stop offset="1" stop-color="#1f2937"/>
        </radialGradient>
        <linearGradient id="soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity=".22"/>
          <stop offset="1" stop-color="#020617" stop-opacity=".2"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#g)"/>
      <path d="M0 130 C45 96 70 162 116 122 C150 92 170 108 200 78 L200 200 L0 200Z" fill="url(#soft)"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomSize() {
  if (window.matchMedia('(max-width: 560px)').matches) return randomBetween(44, 64);
  if (window.matchMedia('(max-width: 900px)').matches) return randomBetween(48, 72);
  return randomBetween(52, 84);
}

function layerRect() {
  return layer.getBoundingClientRect();
}

function overlapsExisting(x, y, size) {
  const padding = 8;
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  return bubbles.some((item) => {
    const otherRadius = item.size / 2;
    const dx = centerX - (item.x + otherRadius);
    const dy = centerY - (item.y + otherRadius);
    const minDistance = radius + otherRadius + padding;
    return dx * dx + dy * dy < minDistance * minDistance;
  });
}

function initialPosition(rect, size) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const x = randomBetween(0, Math.max(0, rect.width - size));
    const y = randomBetween(0, Math.max(0, rect.height - size));
    if (!overlapsExisting(x, y, size)) return { x, y };
  }

  return {
    x: randomBetween(0, Math.max(0, rect.width - size)),
    y: randomBetween(0, Math.max(0, rect.height - size))
  };
}

function gridPositions(rect) {
  const topReserve = window.matchMedia('(max-width: 560px)').matches ? 76 : 88;
  const sideGap = window.matchMedia('(max-width: 560px)').matches ? 18 : 36;
  const largest = Math.max(...bubbles.map((item) => item.size));
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
      x: Math.min(Math.max(0, x), Math.max(0, rect.width - item.size)),
      y: Math.min(Math.max(0, y), Math.max(0, rect.height - item.size))
    };
  });
}

function applyGridTargets() {
  const rect = layerRect();
  const positions = gridPositions(rect);
  bubbles.forEach((item, index) => {
    item.targetX = positions[index].x;
    item.targetY = positions[index].y;
    item.paused = true;
  });
}

function setLayoutMode(mode) {
  layoutMode = mode;
  document.body.classList.toggle('is-grid-mode', mode === 'grid');
  layoutToggle.setAttribute('aria-pressed', String(mode === 'grid'));
  layoutToggle.textContent = mode === 'grid' ? '自由布局' : '网格布局';

  if (mode === 'grid') {
    applyGridTargets();
    return;
  }

  for (const item of bubbles) {
    item.paused = false;
    item.vx = item.vx || randomBetween(-0.14, 0.14) || 0.1;
    item.vy = item.vy || randomBetween(-0.14, 0.14) || -0.1;
  }
}

function createBubble([label, color, pale, type], index) {
  const node = document.createElement('div');
  node.className = 'bubble';
  node.style.setProperty('--size', `${randomSize()}px`);
  node.innerHTML = `
    <img src="${imageFor(label, color, pale, type)}" alt="${label}" draggable="false" />
    <span>${label}</span>
  `;
  layer.appendChild(node);

  const rect = layerRect();
  const size = parseFloat(node.style.getPropertyValue('--size'));
  const position = initialPosition(rect, size);
  const item = {
    node,
    size,
    x: position.x,
    y: position.y,
    vx: randomBetween(-0.16, 0.16) || 0.12,
    vy: randomBetween(-0.16, 0.16) || -0.12,
    targetX: position.x,
    targetY: position.y,
    paused: false,
    dragging: false
  };

  node.style.zIndex = String(index + 1);
  node.addEventListener('pointerenter', () => {
    item.paused = true;
  });
  node.addEventListener('pointerleave', () => {
    if (!item.dragging) item.paused = false;
  });
  node.addEventListener('pointerdown', (event) => startDrag(event, item));
  bubbles.push(item);
}

function startDrag(event, item) {
  if (layoutMode === 'grid') return;

  const rect = layerRect();
  pointer.id = event.pointerId;
  pointer.item = item;
  pointer.offsetX = event.clientX - rect.left - item.x;
  pointer.offsetY = event.clientY - rect.top - item.y;
  item.dragging = true;
  item.paused = true;
  item.node.classList.add('is-dragging');
  item.node.setPointerCapture(event.pointerId);
}

function moveDrag(event) {
  if (pointer.item === null || event.pointerId !== pointer.id) return;
  const rect = layerRect();
  const item = pointer.item;
  item.x = Math.min(Math.max(0, event.clientX - rect.left - pointer.offsetX), rect.width - item.size);
  item.y = Math.min(Math.max(0, event.clientY - rect.top - pointer.offsetY), rect.height - item.size);
}

function stopDrag(event) {
  if (pointer.item === null || event.pointerId !== pointer.id) return;
  const item = pointer.item;
  item.dragging = false;
  item.paused = false;
  item.node.classList.remove('is-dragging');
  pointer.id = null;
  pointer.item = null;
}

function resolveCollisions(bounds) {
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
    item.x = Math.min(Math.max(0, item.x), Math.max(0, bounds.width - item.size));
    item.y = Math.min(Math.max(0, item.y), Math.max(0, bounds.height - item.size));
    item.vx = Math.max(-0.2, Math.min(0.2, item.vx));
    item.vy = Math.max(-0.2, Math.min(0.2, item.vy));
  }
}

function animate() {
  const rect = layerRect();

  if (layoutMode === 'grid') {
    for (const item of bubbles) {
      item.x += (item.targetX - item.x) * 0.08;
      item.y += (item.targetY - item.y) * 0.08;
      item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }

    requestAnimationFrame(animate);
    return;
  }

  for (const item of bubbles) {
    if (!item.paused && !item.dragging) {
      item.x += item.vx;
      item.y += item.vy;

      if (item.x <= 0 || item.x >= rect.width - item.size) item.vx *= -1;
      if (item.y <= 0 || item.y >= rect.height - item.size) item.vy *= -1;

      item.x = Math.min(Math.max(0, item.x), Math.max(0, rect.width - item.size));
      item.y = Math.min(Math.max(0, item.y), Math.max(0, rect.height - item.size));
    }
  }

  resolveCollisions(rect);

  for (const item of bubbles) {
    item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
  }

  requestAnimationFrame(animate);
}

function keepInside() {
  const rect = layerRect();
  for (const item of bubbles) {
    item.size = item.node.getBoundingClientRect().width;
    item.x = Math.min(item.x, Math.max(0, rect.width - item.size));
    item.y = Math.min(item.y, Math.max(0, rect.height - item.size));
  }

  if (layoutMode === 'grid') applyGridTargets();
}

items.forEach(createBubble);
layoutToggle.addEventListener('click', () => {
  setLayoutMode(layoutMode === 'free' ? 'grid' : 'free');
});
window.addEventListener('pointermove', moveDrag);
window.addEventListener('pointerup', stopDrag);
window.addEventListener('pointercancel', stopDrag);
window.addEventListener('resize', keepInside);
requestAnimationFrame(animate);
