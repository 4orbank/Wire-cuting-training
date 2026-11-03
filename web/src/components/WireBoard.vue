<script setup>
import { computed } from 'vue';

const props = defineProps({
  wires: { type: Array, required: true },
  cutIndex: { type: Number, default: null },     // เส้นที่ผู้เล่นตัด
  correctIndex: { type: Number, default: null }, // มีค่าเมื่อจบรอบแล้ว (เฉลย)
  locked: { type: Boolean, default: false },
});
const emit = defineEmits(['cut']);

// สีเรียบ ไม่มีแสงเงา
const HEX = { white: '#f1f1ee', red: '#e5484d', blue: '#3b82f6', yellow: '#f5b83d' };
const NAME = { white: 'ขาว', red: 'แดง', blue: 'ฟ้า', yellow: 'เหลือง' };
const W = 600, X0 = 56, X1 = 544, GAP = 52, TOP = 34, HALF_GAP = 18;
const MID = (X0 + X1) / 2;

const height = computed(() => TOP * 2 + (props.wires.length - 1) * GAP);
const done = computed(() => props.correctIndex !== null);
const y = (i) => TOP + i * GAP;

const state = (i) => ({
  locked: props.locked,
  cut: props.cutIndex === i,
  reveal: done.value && props.correctIndex === i && props.cutIndex !== i,
  dim: done.value && props.cutIndex !== i && props.correctIndex !== i,
});

function pick(i) {
  if (!props.locked) emit('cut', i);
}
</script>

<template>
  <svg class="board" :viewBox="`0 0 ${W} ${height}`" role="group" aria-label="แผงสายไฟ">
    <g
      v-for="(color, i) in wires"
      :key="i"
      class="wire"
      :class="state(i)"
      role="button"
      :tabindex="locked ? -1 : 0"
      :aria-label="`ตัดสายเส้นที่ ${i + 1} สี${NAME[color]}`"
      @click="pick(i)"
      @keydown.enter.prevent="pick(i)"
      @keydown.space.prevent="pick(i)"
    >
      <text class="idx" :x="18" :y="y(i) + 5">{{ i + 1 }}</text>
      <circle class="term" :cx="X0 - 14" :cy="y(i)" r="6" />
      <circle class="term" :cx="X1 + 14" :cy="y(i)" r="6" />

      <line v-if="cutIndex !== i" class="strand" :stroke="HEX[color]"
            :x1="X0" :y1="y(i)" :x2="X1" :y2="y(i)" />
      <template v-else>
        <line class="strand half left" :stroke="HEX[color]"
              :x1="X0" :y1="y(i)" :x2="MID - HALF_GAP" :y2="y(i)" />
        <line class="strand half right" :stroke="HEX[color]"
              :x1="MID + HALF_GAP" :y1="y(i)" :x2="X1" :y2="y(i)" />
      </template>

      <text v-if="state(i).reveal" class="tick" :x="X1 + 44" :y="y(i) + 7">✓</text>
      <line class="hit" :x1="X0" :y1="y(i)" :x2="X1" :y2="y(i)" />
    </g>
  </svg>
</template>

<style scoped>
.board { width: 100%; height: auto; max-width: 640px; display: block; }
.wire { cursor: pointer; outline: none; transition: opacity .25s; }
.wire.locked { cursor: default; }
.wire.dim { opacity: .3; }

.strand { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-width .15s; }
.hit { stroke: transparent; stroke-width: 36; pointer-events: stroke; }
.term { fill: #2a3544; transition: fill .2s; }
.idx { fill: #6b7a8e; font: 500 14px var(--font); text-anchor: middle; }

.wire:not(.locked):hover .strand { stroke-width: 11; }
.wire:not(.locked):hover .term, .wire:focus-visible .term { fill: var(--accent); }

.reveal .term { fill: var(--ok); }
.tick { fill: var(--ok); font: 600 20px var(--font); text-anchor: middle; }

.half.left  { animation: snapL .25s ease-out both; }
.half.right { animation: snapR .25s ease-out both; }
@keyframes snapL { to { transform: translate(-8px, 5px); } }
@keyframes snapR { to { transform: translate(8px, -5px); } }

@media (prefers-reduced-motion: reduce) {
  .half { animation: none; }
  .half.left { transform: translate(-8px, 5px); }
  .half.right { transform: translate(8px, -5px); }
}
</style>
