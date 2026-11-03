<script setup>
import { computed } from 'vue';

const props = defineProps({
  remainingMs: { type: Number, default: 0 },
  totalMs: { type: Number, default: 0 },
});

const ratio = computed(() => (props.totalMs ? Math.min(1, props.remainingMs / props.totalMs) : 0));
const level = computed(() => (ratio.value > 0.4 ? 'ok' : ratio.value > 0.2 ? 'warn' : 'danger'));
const label = computed(() => (props.remainingMs / 1000).toFixed(1));
</script>

<template>
  <div class="timer" :class="level" role="timer" aria-label="เวลาที่เหลือ">
    <div class="track"><div class="fill" :style="{ transform: `scaleX(${ratio})` }"></div></div>
    <span class="num">{{ label }}<small>วิ</small></span>
  </div>
</template>
