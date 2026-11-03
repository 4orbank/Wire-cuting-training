<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({ result: { type: Object, required: true } });
defineEmits(['restart']);

const META = {
  correct: { title: 'ตัดถูก', icon: '✓' },
  wrong: { title: 'ตัดผิด', icon: '✕' },
  timeout: { title: 'หมดเวลา', icon: '!' },
};
const meta = computed(() => META[props.result.outcome]);
const button = ref(null);
onMounted(() => button.value?.focus());
</script>

<template>
  <section class="result" :class="result.outcome" aria-live="assertive">
    <div class="verdict">
      <span class="badge" aria-hidden="true">{{ meta.icon }}</span>
      <div>
        <h2>{{ meta.title }}</h2>
        <p v-if="result.correct">ใช้เวลา {{ (result.elapsedMs / 1000).toFixed(1) }} วินาที</p>
        <p v-else>เส้นที่ถูกต้องคือเส้นที่ {{ result.correctIndex + 1 }}</p>
      </div>
      <button ref="button" class="again" @click="$emit('restart')">เล่นใหม่</button>
    </div>
    <p class="why">{{ result.ruleText }}</p>
  </section>
</template>
