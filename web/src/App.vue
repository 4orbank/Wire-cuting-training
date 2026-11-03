<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { api } from './api.js';
import { useCountdown } from './composables/useCountdown.js';
import WireBoard from './components/WireBoard.vue';
import TimerBar from './components/TimerBar.vue';
import ResultPanel from './components/ResultPanel.vue';
import RulesPanel from './components/RulesPanel.vue';

// status: loading | playing | submitting | done | error
const status = ref('loading');
const round = ref(null);
const cutIndex = ref(null);
const result = ref(null);
const rules = ref(null);
const score = ref({ correct: 0, total: 0, streak: 0 });
const { remainingMs, totalMs, start, stop, reset } = useCountdown();

const wireCount = computed(() => round.value?.wires.length ?? null);
const locked = computed(() => status.value !== 'playing');

async function startRound() {
  stop(); reset();
  status.value = 'loading';
  round.value = null; result.value = null; cutIndex.value = null;
  try {
    round.value = await api.createRound();
    status.value = 'playing';
    start(round.value.timeLimitMs, () => cut(null)); // หมดเวลา = ส่ง null
  } catch {
    status.value = 'error';
  }
}

async function cut(index) {
  if (status.value !== 'playing') return;
  status.value = 'submitting';
  stop();
  cutIndex.value = index;
  try {
    result.value = await api.cut(round.value.roundId, index);
    const s = score.value;
    s.total += 1;
    s.correct += result.value.correct ? 1 : 0;
    s.streak = result.value.correct ? s.streak + 1 : 0;
    status.value = 'done';
  } catch {
    status.value = 'error';
  }
}

function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey || status.value !== 'playing') return;
  const i = Number(e.key) - 1;
  if (Number.isInteger(i) && i >= 0 && i < wireCount.value) cut(i);
}

onMounted(async () => {
  window.addEventListener('keydown', onKey);
  startRound();
  try { rules.value = (await api.rules()).groups; } catch { /* คู่มือเป็นส่วนเสริม */ }
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <main class="stage">
    <section class="window">
      <header class="bar">
        <div class="title">
          <h1>ฝึกตัดสายไฟ</h1>
          <span v-if="wireCount" class="chip">{{ wireCount }} WIRES</span>
        </div>
        <div class="score">
          <span class="stat">ถูก <b>{{ score.correct }}/{{ score.total }}</b></span>
          <span class="stat">ต่อเนื่อง <b>{{ score.streak }}</b></span>
        </div>
      </header>

      <TimerBar :remaining-ms="remainingMs" :total-ms="totalMs" />

      <div class="board-wrap">
        <WireBoard
          v-if="round"
          :wires="round.wires"
          :cut-index="cutIndex"
          :correct-index="result ? result.correctIndex : null"
          :locked="locked"
          @cut="cut"
        />
        <p v-else-if="status === 'loading'" class="empty">กำลังโหลดโจทย์…</p>
      </div>

      <div class="footer">
        <ResultPanel v-if="status === 'done'" :result="result" @restart="startRound" />
        <div v-else-if="status === 'error'" class="error" role="alert">
          <p>เชื่อมต่อ API ไม่ได้ ตรวจสอบว่า API ทำงานอยู่ แล้วลองใหม่</p>
          <button class="again" @click="startRound">ลองใหม่</button>
        </div>
        <p v-else-if="status === 'playing'" class="hint">คลิกสายที่ต้องการตัด หรือกดเลข 1–{{ wireCount }}</p>
      </div>
    </section>

    <aside class="side" aria-label="เงื่อนไขการตัดสาย">
      <h2 class="side-title">เงื่อนไข</h2>
      <RulesPanel
        v-if="rules"
        :groups="rules"
        :active-wires="wireCount"
        :matched-id="result ? result.ruleId : null"
      />
      <p v-else class="empty">กำลังโหลดเงื่อนไข…</p>
    </aside>
  </main>
</template>
