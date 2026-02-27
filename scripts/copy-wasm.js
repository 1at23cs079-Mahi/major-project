/**
 * Copies WASM binaries from node_modules to public/ so they stay in sync
 * with the installed npm package versions.
 *
 * Run automatically via the "postinstall" npm script.
 *
 * MediaPipe tasks-vision WASM  → public/wasm/mediapipe/
 * ONNX Runtime Web WASM        → public/wasm/ort/
 */

import { cpSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const copies = [
  {
    label: 'MediaPipe tasks-vision WASM',
    src: resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm'),
    dest: resolve(root, 'public/wasm/mediapipe'),
  },
  {
    label: 'ONNX Runtime Web WASM',
    src: resolve(root, 'node_modules/onnxruntime-web/dist'),
    dest: resolve(root, 'public/wasm/ort'),
  },
];

for (const { label, src, dest } of copies) {
  if (!existsSync(src)) {
    console.warn(`⚠  ${label}: source not found at ${src} — skipping`);
    continue;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`✓  ${label} → ${dest}`);
}
