import { COLORS, WIRE_COUNTS } from './constants.js';

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// rng ฉีดเข้ามาได้ (ใช้ทดสอบแบบ deterministic)
export function generateWires(rng = Math.random, count = pick(WIRE_COUNTS, rng)) {
  return Array.from({ length: count }, () => pick(COLORS, rng));
}
