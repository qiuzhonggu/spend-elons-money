<script setup>
import AnimatedNumber from './AnimatedNumber.vue'

defineProps({
  remaining: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    required: true,
  },
  percent: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <header class="app-header">
    <div class="brand-block">
      <p class="eyebrow">Spend it all</p>
      <h1>花光马斯克的钱</h1>
    </div>
    <div class="header-metrics" aria-label="资产概览">
      <div>
        <span>剩余资产</span>
        <strong><AnimatedNumber :value="remaining" compact /></strong>
      </div>
      <div>
        <span>已消费</span>
        <strong><AnimatedNumber :value="spent" compact /></strong>
      </div>
      <div>
        <span>进度</span>
        <strong>{{ percent.toFixed(4) }}%</strong>
      </div>
    </div>
  </header>
</template>
