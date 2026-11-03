import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, judge, generateWires, RULES, WIRE_COUNTS } from '../src/index.js';

const idx = (wires) => solve(wires).index;

test('3 สาย', () => {
  assert.equal(idx(['red', 'red', 'blue']), 2);            // ไม่มีขาว -> เส้นที่ 3
  assert.equal(idx(['white', 'red', 'blue']), 2);          // สุดท้ายฟ้า -> สุดท้าย
  assert.equal(solve(['white', 'red', 'blue']).ruleId, '3-2');
  assert.equal(idx(['yellow', 'white', 'yellow']), 2);     // เหลือง>1 -> เหลืองสุดท้าย
  assert.equal(idx(['white', 'red', 'red']), 0);           // ไม่เข้าเงื่อนไข -> แรก
});

test('4 สาย', () => {
  assert.equal(idx(['white', 'white', 'red', 'blue']), 3); // ขาว>1 -> สุดท้าย
  assert.equal(idx(['blue', 'red', 'yellow', 'yellow']), 0); // แดง=1 -> แรก (มาก่อนข้อ 3)
  assert.equal(idx(['blue', 'white', 'blue', 'yellow']), 3); // สุดท้ายเหลือง
  assert.equal(idx(['blue', 'yellow', 'blue', 'white']), 2); // ฟ้า>1 -> ฟ้าเส้นสุดท้าย
  assert.equal(idx(['white', 'yellow', 'red', 'red']), 1);   // ไม่เข้า -> เส้นที่ 2
});

test('5 สาย', () => {
  assert.equal(idx(['red', 'blue', 'yellow', 'blue', 'red']), 2); // ไม่มีขาว -> ที่ 3
  assert.equal(idx(['white', 'red', 'blue', 'blue', 'yellow']), 3); // แดง=1 ฟ้า>1 -> ที่ 4
  assert.equal(idx(['white', 'blue', 'yellow', 'white', 'yellow']), 1); // ไม่มีแดง -> ที่ 2
  assert.equal(idx(['white', 'red', 'red', 'blue', 'yellow']), 4);  // ไม่เข้า -> สุดท้าย
});

test('6 สาย', () => {
  assert.equal(idx(['white', 'white', 'blue', 'red', 'yellow', 'red']), 4); // ฟ้า=1 ขาว>1 -> ที่ 5
  assert.equal(idx(['white', 'blue', 'blue', 'yellow', 'yellow', 'white']), 0); // ไม่มีแดง -> แรก
  assert.equal(idx(['red', 'yellow', 'blue', 'yellow', 'white', 'yellow']), 5); // เหลือง>1 -> เหลืองสุดท้าย
  assert.equal(idx(['red', 'white', 'blue', 'blue', 'white', 'red']), 2);       // ไม่เข้า -> ที่ 3
});

test('judge: ถูก / ผิด / หมดเวลา', () => {
  const w = ['red', 'red', 'blue'];
  assert.equal(judge(w, 2).outcome, 'correct');
  assert.equal(judge(w, 0).outcome, 'wrong');
  assert.equal(judge(w, null).outcome, 'timeout');
  assert.equal(judge(w, 2, { timedOut: true }).outcome, 'timeout');
});

test('ทุกกลุ่มมีข้อ fallback และสุ่ม 5,000 รอบแล้ว index ไม่หลุดช่วง', () => {
  for (const n of WIRE_COUNTS) assert.equal(RULES[n].at(-1).when([]), true);
  for (let i = 0; i < 5000; i++) {
    const wires = generateWires();
    const { index } = solve(wires);
    assert.ok(Number.isInteger(index) && index >= 0 && index < wires.length, wires.join());
  }
});
