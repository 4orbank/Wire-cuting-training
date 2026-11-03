import { ref, onBeforeUnmount } from 'vue';

export function useCountdown() {
  const remainingMs = ref(0);
  const totalMs = ref(0);
  let raf = 0;
  let endAt = 0;
  let onEnd = null;

  const tick = () => {
    remainingMs.value = Math.max(0, endAt - performance.now());
    if (remainingMs.value > 0) { raf = requestAnimationFrame(tick); return; }
    const cb = onEnd; raf = 0; onEnd = null;
    cb?.();
  };

  function stop() { cancelAnimationFrame(raf); raf = 0; onEnd = null; }
  function reset() { stop(); remainingMs.value = totalMs.value; }
  function start(ms, cb) {
    stop();
    totalMs.value = ms; remainingMs.value = ms;
    endAt = performance.now() + ms; onEnd = cb;
    raf = requestAnimationFrame(tick);
  }

  onBeforeUnmount(stop);
  return { remainingMs, totalMs, start, stop, reset };
}
