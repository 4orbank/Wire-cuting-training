<script setup>
defineProps({
  groups: { type: Array, required: true },
  activeWires: { type: Number, default: null },
  matchedId: { type: String, default: null },
});
</script>

<template>
  <div class="rules">
    <article v-for="g in groups" :key="g.wires" class="card" :class="{ active: g.wires === activeWires }">
      <h3>{{ g.wires }} WIRES</h3>
      <ul>
        <li v-for="r in g.rules" :key="r.id" :class="{ hit: r.id === matchedId }">{{ r.text }}</li>
      </ul>
    </article>
  </div>
</template>
