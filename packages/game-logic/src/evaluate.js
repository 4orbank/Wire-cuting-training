import { RULES } from './rules.js';

// หาคำตอบที่ถูกต้อง: คืน { index, ruleId, ruleText }
export function solve(wires) {
  const list = RULES[wires.length];
  if (!list) throw new RangeError(`ไม่รองรับสายไฟ ${wires.length} เส้น`);
  const rule = list.find((r) => r.when(wires));
  return { index: rule.cut(wires), ruleId: rule.id, ruleText: rule.text };
}

// ตัดสินผล: cutIndex = null หมายถึงหมดเวลา
export function judge(wires, cutIndex, { timedOut = false } = {}) {
  const answer = solve(wires);
  const outcome = timedOut || cutIndex === null
    ? 'timeout'
    : cutIndex === answer.index ? 'correct' : 'wrong';
  return {
    outcome,
    correct: outcome === 'correct',
    cutIndex,
    correctIndex: answer.index,
    ruleId: answer.ruleId,
    ruleText: answer.ruleText,
  };
}
