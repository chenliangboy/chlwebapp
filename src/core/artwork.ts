export function imageFor(label = '', color = '#64748b', pale = '#e2e8f0', image = '') {
  if (image) return image;

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
      <title>${label}</title>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
