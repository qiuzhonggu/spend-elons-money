<script setup>
import AnimatedNumber from './AnimatedNumber.vue'

defineProps({
  initialBalance: {
    type: Number,
    required: true,
  },
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
  totalItems: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <section class="stats-panel" aria-label="消费统计">
    <div class="progress-track">
      <div class="progress-bar" :style="{ width: `${Math.min(100, percent)}%` }"></div>
    </div>
    <div class="stats-grid">
      <div>
        <span>总资产</span>
        <strong><AnimatedNumber :value="initialBalance" /></strong>
      </div>
      <div>
        <span>剩余金额</span>
        <strong><AnimatedNumber :value="remaining" /></strong>
      </div>
      <div>
        <span>已花掉</span>
        <strong><AnimatedNumber :value="spent" /></strong>
      </div>
      <div>
        <span>购物件数</span>
        <strong>{{ totalItems.toLocaleString('zh-CN') }}</strong>
      </div>
    </div>
  </section>
</template>
