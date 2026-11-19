/**
 * Gera os ícones PNG da PWA a partir do brasão do CEPK Absence.
 * Uso: npm run icons:generate
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = path.join(root, "public", "icons");

const BACKGROUND = "#0d2417";
const LIME = "#a3e635";

function brandSvg({ size, padding, rounded }) {
  const scale = (size * (1 - padding * 2)) / 64;
  const offset = (size - 64 * scale) / 2;
  const radius = rounded ? size * 0.22 : 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BACKGROUND}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <g fill="none" stroke="${LIME}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="10.5" y="15" width="40" height="37" rx="7"/>
      <path d="M10.5 26.5v-3.5a7 7 0 0 1 7-7h26a7 7 0 0 1 7 7v3.5H10.5Z" fill="${LIME}" stroke="none"/>
      <path d="M21.5 10.5v8M39.5 10.5v8"/>
    </g>
    <g fill="${LIME}" opacity="0.35">
      <rect x="18" y="32" width="5.5" height="5.5" rx="1.4"/>
      <rect x="27" y="32" width="5.5" height="5.5" rx="1.4"/>
      <rect x="36" y="32" width="5.5" height="5.5" rx="1.4"/>
      <rect x="18" y="41" width="5.5" height="5.5" rx="1.4"/>
      <rect x="27" y="41" width="5.5" height="5.5" rx="1.4"/>
    </g>
    <circle cx="43" cy="44" r="11.5" fill="${LIME}" stroke="${BACKGROUND}" stroke-width="3.4"/>
    <path d="m37.8 44.2 3.6 3.6 6.7-7.2" fill="none" stroke="${BACKGROUND}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function render(file, { size, padding, rounded = true }) {
  const target = path.join(root, "public", file);
  await sharp(Buffer.from(brandSvg({ size, padding, rounded })))
    .png({ compressionLevel: 9 })
    .toFile(target);
  console.log(`ícone gerado: public/${file}`);
}

await mkdir(iconsDir, { recursive: true });

await render("icons/icon-192.png", { size: 192, padding: 0.11 });
await render("icons/icon-512.png", { size: 512, padding: 0.11 });
await render("icons/icon-maskable-512.png", { size: 512, padding: 0.19, rounded: false });
await render("apple-touch-icon.png", { size: 180, padding: 0.1, rounded: false });
