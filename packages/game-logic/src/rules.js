// กติกาทั้งหมดอยู่ที่ไฟล์นี้ไฟล์เดียว (single source of truth)
// - ตรวจจากบนลงล่าง ข้อแรกที่ when() เป็นจริงจะถูกใช้
// - ข้อสุดท้ายของทุกกลุ่มคือ "ไม่เข้าเงื่อนไขใดเลย" (when เป็นจริงเสมอ)
// - cut() คืนค่า index แบบเริ่มที่ 0
const count = (w, c) => w.filter((x) => x === c).length;
const lastIdx = (w) => w.length - 1;
const lastOf = (w, c) => w.lastIndexOf(c);

export const RULES = {
  3: [
    { id: '3-1', text: 'ถ้าไม่มีสายไฟสีขาว ให้ตัดเส้นที่สาม',
      when: (w) => count(w, 'white') === 0, cut: () => 2 },
    { id: '3-2', text: 'ถ้าเส้นสุดท้ายเป็นสีฟ้า ให้ตัดเส้นสุดท้าย',
      when: (w) => w[lastIdx(w)] === 'blue', cut: lastIdx },
    { id: '3-3', text: 'ถ้ามีสีเหลืองมากกว่าหนึ่งเส้น ให้ตัดสีเหลืองเส้นสุดท้าย',
      when: (w) => count(w, 'yellow') > 1, cut: (w) => lastOf(w, 'yellow') },
    { id: '3-4', text: 'ถ้าไม่เข้าเงื่อนไขใดเลย ให้ตัดเส้นแรก',
      when: () => true, cut: () => 0 },
  ],
  4: [
    { id: '4-1', text: 'ถ้ามีสีขาวมากกว่าหนึ่งเส้น ให้ตัดเส้นสุดท้าย',
      when: (w) => count(w, 'white') > 1, cut: lastIdx },
    { id: '4-2', text: 'ถ้ามีสีแดงหนึ่งเส้น ให้ตัดเส้นแรก',
      when: (w) => count(w, 'red') === 1, cut: () => 0 },
    { id: '4-3', text: 'ถ้าเส้นสุดท้ายเป็นสีเหลือง ให้ตัดเส้นสุดท้าย',
      when: (w) => w[lastIdx(w)] === 'yellow', cut: lastIdx },
    { id: '4-4', text: 'ถ้ามีสีฟ้ามากกว่าหนึ่งเส้น ให้ตัดสีฟ้าเส้นสุดท้าย',
      when: (w) => count(w, 'blue') > 1, cut: (w) => lastOf(w, 'blue') },
    { id: '4-5', text: 'ถ้าไม่เข้าเงื่อนไขใดเลย ให้ตัดเส้นที่สอง',
      when: () => true, cut: () => 1 },
  ],
  5: [
    { id: '5-1', text: 'ถ้าไม่มีสายไฟสีขาว ให้ตัดเส้นที่สาม',
      when: (w) => count(w, 'white') === 0, cut: () => 2 },
    { id: '5-2', text: 'ถ้ามีสีแดงหนึ่งเส้นและสีฟ้ามากกว่าหนึ่งเส้น ให้ตัดเส้นที่สี่',
      when: (w) => count(w, 'red') === 1 && count(w, 'blue') > 1, cut: () => 3 },
    { id: '5-3', text: 'ถ้าไม่มีสีแดง ให้ตัดเส้นที่สอง',
      when: (w) => count(w, 'red') === 0, cut: () => 1 },
    { id: '5-4', text: 'ถ้าไม่เข้าเงื่อนไขใดเลย ให้ตัดเส้นสุดท้าย',
      when: () => true, cut: lastIdx },
  ],
  6: [
    { id: '6-1', text: 'ถ้ามีสีฟ้าหนึ่งเส้นและสีขาวมากกว่าหนึ่งเส้น ให้ตัดเส้นที่ห้า',
      when: (w) => count(w, 'blue') === 1 && count(w, 'white') > 1, cut: () => 4 },
    { id: '6-2', text: 'ถ้าไม่มีสีแดง ให้ตัดเส้นแรก',
      when: (w) => count(w, 'red') === 0, cut: () => 0 },
    { id: '6-3', text: 'ถ้ามีสีเหลืองมากกว่าหนึ่งเส้น ให้ตัดสีเหลืองเส้นสุดท้าย',
      when: (w) => count(w, 'yellow') > 1, cut: (w) => lastOf(w, 'yellow') },
    { id: '6-4', text: 'ถ้าไม่เข้าเงื่อนไขใดเลย ให้ตัดเส้นที่สาม',
      when: () => true, cut: () => 2 },
  ],
};

// รูปแบบที่ส่งให้ web แสดงได้ (ไม่มีฟังก์ชัน)
export function describeRules() {
  return Object.entries(RULES).map(([wires, list]) => ({
    wires: Number(wires),
    rules: list.map(({ id, text }) => ({ id, text })),
  }));
}
