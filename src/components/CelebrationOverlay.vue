<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['reset'])
</script>

<template>
  <Transition name="celebrate">
    <div v-if="show" class="celebration" role="dialog" aria-modal="true">
      <div class="confetti" aria-hidden="true">
        <i v-for="index in 36" :key="index" :style="{ '--i': index }"></i>
      </div>
      <div class="celebration-card">
        <p class="eyebrow">Mission complete</p>
        <h2>恭喜你花光了马斯克的钱！</h2>
        <p>资产余额已经归零，购物车也抵达了人类想象力的边界。</p>
        <button type="button" @click="$emit('reset')">再玩一次</button>
      </div>
    </div>
  </Transition>
</template>
