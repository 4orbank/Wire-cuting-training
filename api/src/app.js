import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { generateWires, judge, describeRules, TIME_LIMIT_MS } from '@wire/game-logic';

const GRACE_MS = 1500;          // เผื่อ latency เครือข่าย
const ROUND_TTL_MS = 60_000;    // รอบที่ไม่มีใครตอบจะถูกลบ
const MAX_ROUNDS = 5000;

export function createApp({ corsOrigins = ['*'], now = Date.now } = {}) {
  const app = express();
  const rounds = new Map(); // id -> { wires, startedAt }

  app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins }));
  app.use(express.json({ limit: '1kb' }));

  const purge = () => {
    const t = now();
    for (const [id, r] of rounds) if (t - r.startedAt > ROUND_TTL_MS) rounds.delete(id);
  };

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/rules', (_req, res) => res.json({ groups: describeRules() }));

  // เริ่มรอบใหม่: ส่งเฉพาะสายไฟ ไม่ส่งคำตอบ
  app.post('/api/rounds', (_req, res) => {
    purge();
    if (rounds.size >= MAX_ROUNDS) return res.status(503).json({ error: 'busy' });
    const wires = generateWires();
    const roundId = randomUUID();
    rounds.set(roundId, { wires, startedAt: now() });
    res.status(201).json({ roundId, wires, timeLimitMs: TIME_LIMIT_MS });
  });

  // ตัดสาย: index = เลข 0.. หรือ null (หมดเวลา)
  app.post('/api/rounds/:id/cut', (req, res) => {
    const round = rounds.get(req.params.id);
    if (!round) return res.status(404).json({ error: 'round_not_found' });

    const index = req.body?.index;
    const valid = index === null || (Number.isInteger(index) && index >= 0 && index < round.wires.length);
    if (!valid) return res.status(400).json({ error: 'invalid_index' });

    rounds.delete(req.params.id); // ตอบได้ครั้งเดียว
    const elapsedMs = now() - round.startedAt;
    const timedOut = elapsedMs > TIME_LIMIT_MS + GRACE_MS;
    res.json({ ...judge(round.wires, index, { timedOut }), elapsedMs });
  });

  return app;
}
