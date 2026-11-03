// ชั้นเดียวที่คุยกับ API — เปลี่ยน URL ที่ .env (VITE_API_URL)
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  rules: () => request('/api/rules'),
  createRound: () => request('/api/rounds', { method: 'POST' }),
  cut: (roundId, index) =>
    request(`/api/rounds/${roundId}/cut`, { method: 'POST', body: JSON.stringify({ index }) }),
};
