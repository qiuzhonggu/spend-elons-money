<script setup>
import { formatCompactCurrency } from '../utils/money'

defineProps({
  bundles: { type: Array, required: true },
  collection: { type: Object, required: true },
  advisor: { type: String, required: true },
  history: { type: Array, required: true },
})

defineEmits(['random', 'bundle', 'undo'])
</script>

<template>
  <section class="playground-panel" aria-label="豪购控制台">
    <div class="playground-heading">
      <div>
        <p class="eyebrow">Spending console</p>
        <h2>豪购控制台</h2>
      </div>
      <div class="playground-actions">
        <button class="random-buy" type="button" @click="$emit('random')">随机豪购</button>
        <button type="button" :disabled="history.length === 0" @click="$emit('undo')">撤销上一笔</button>
      </div>
    </div>

    <div class="playground-grid">
      <div class="advisor-block">
        <p class="eyebrow">Advisor</p>
        <strong>{{ advisor }}</strong>
        <div class="collection-row">
          <span>全品类收藏 {{ collection.collected }} / {{ collection.total }}</span>
          <span>进度 {{ collection.percent }}%</span>
        </div>
        <div class="collection-track" aria-hidden="true">
          <span :style="{ width: `${collection.percent}%` }"></span>
        </div>
      </div>

      <div class="bundle-block">
        <p class="eyebrow">Curated bundles</p>
        <div class="bundle-list">
          <button
            v-for="bundle in bundles"
            :key="bundle.id"
            type="button"
            :title="bundle.description"
            @click="$emit('bundle', bundle.id)"
          >
            <strong>{{ bundle.name }}</strong>
            <span>{{ bundle.description }}</span>
          </button>
        </div>
      </div>

      <div class="history-block">
        <p class="eyebrow">Recent moves</p>
        <ol v-if="history.length" class="action-history">
          <li v-for="action in history.slice().reverse().slice(0, 5)" :key="action.id">
            <span>{{ action.label }}</span>
            <strong>{{ action.total < 0 ? '+' : '-' }}{{ formatCompactCurrency(Math.abs(action.total)) }}</strong>
          </li>
        </ol>
        <p v-else class="empty-line">消费历史等待第一笔豪购。</p>
      </div>
    </div>
  </section>
</template>
