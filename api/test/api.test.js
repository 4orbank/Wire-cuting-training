import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { solve, TIME_LIMIT_MS } from '@wire/game-logic';
import { createApp } from '../src/app.js';

let server, base, clock = 1_000_000;

before(async () => {
  const app = createApp({ now: () => clock });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

test('เริ่มรอบ: ได้สายไฟ แต่ไม่รั่วคำตอบ', async () => {
  const res = await post('/api/rounds');
  assert.equal(res.status, 201);
  const round = await res.json();
  assert.ok(round.wires.length >= 3 && round.wires.length <= 6);
  assert.equal(round.timeLimitMs, TIME_LIMIT_MS);
  assert.equal(round.correctIndex, undefined);
});

test('ตัดถูก / ตัดผิด / ตอบซ้ำไม่ได้', async () => {
  const r1 = await (await post('/api/rounds')).json();
  const answer = solve(r1.wires).index;
  const ok = await (await post(`/api/rounds/${r1.roundId}/cut`, { index: answer })).json();
  assert.equal(ok.outcome, 'correct');
  assert.equal((await post(`/api/rounds/${r1.roundId}/cut`, { index: answer })).status, 404);

  const r2 = await (await post('/api/rounds')).json();
  const wrong = (solve(r2.wires).index + 1) % r2.wires.length;
  const bad = await (await post(`/api/rounds/${r2.roundId}/cut`, { index: wrong })).json();
  assert.equal(bad.outcome, 'wrong');
  assert.equal(bad.correctIndex, solve(r2.wires).index);
});

test('หมดเวลา: ส่ง null หรือส่งช้าเกินเวลา', async () => {
  const r1 = await (await post('/api/rounds')).json();
  const t1 = await (await post(`/api/rounds/${r1.roundId}/cut`, { index: null })).json();
  assert.equal(t1.outcome, 'timeout');

  const r2 = await (await post('/api/rounds')).json();
  clock += TIME_LIMIT_MS + 2000; // เกินเวลา + ช่วงเผื่อเน็ต 1.5 วินาที
  const t2 = await (await post(`/api/rounds/${r2.roundId}/cut`, { index: solve(r2.wires).index })).json();
  assert.equal(t2.outcome, 'timeout');
});

test('ตรวจ input และ rules endpoint', async () => {
  const r = await (await post('/api/rounds')).json();
  assert.equal((await post(`/api/rounds/${r.roundId}/cut`, { index: 99 })).status, 400);
  assert.equal((await post(`/api/rounds/${r.roundId}/cut`, { index: 'x' })).status, 400);
  const { groups } = await (await fetch(base + '/api/rules')).json();
  assert.deepEqual(groups.map((g) => g.wires), [3, 4, 5, 6]);
});
