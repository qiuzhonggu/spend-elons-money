<script setup>
import { formatCompactCurrency } from '../utils/money'
import { resolveProductImage } from '../utils/productImage'

const rankStyle = { '--rank-image': `url("${resolveProductImage('/products/starship-program.webp')}")` }

defineProps({
  title: {
    type: Object,
    required: true,
  },
  mission: {
    type: Object,
    required: true,
  },
  milestone: {
    type: Object,
    required: true,
  },
  achievements: {
    type: Array,
    required: true,
  },
  facts: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  spreeCount: {
    type: Number,
    required: true,
  },
  latestPurchase: {
    type: Object,
    default: null,
  },
  surpriseEvent: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <section class="game-lab" aria-label="趣味玩法面板">
    <div class="lab-card rank-card" :style="rankStyle">
      <p class="eyebrow">Level</p>
      <h2>{{ title.label }}</h2>
      <p>当前连买热度：{{ spreeCount }}。连续购买越多，越容易触发惊喜事件。</p>
    </div>

    <div class="lab-card mission-card">
      <p class="eyebrow">Mission</p>
      <h3>{{ mission.title }}</h3>
      <p>{{ mission.description }}</p>
      <div class="mini-progress">
        <span :style="{ width: `${milestone.progress}%` }"></span>
      </div>
      <small>下一里程碑：{{ milestone.next.label }}</small>
    </div>

    <Transition name="toast">
      <div v-if="surpriseEvent" class="lab-card event-card">
        <p class="eyebrow">Event</p>
        <h3>{{ surpriseEvent.title }}</h3>
        <p>{{ surpriseEvent.description }}</p>
      </div>
    </Transition>

    <div v-if="latestPurchase" class="lab-card spotlight-card">
      <p class="eyebrow">Latest</p>
      <h3>{{ latestPurchase.name }}</h3>
      <p>{{ latestPurchase.category }} · {{ formatCompactCurrency(latestPurchase.price) }}</p>
    </div>

    <div class="lab-card">
      <p class="eyebrow">Achievements</p>
      <div class="badge-list">
        <span v-for="achievement in achievements" :key="achievement.id" :title="achievement.description">
          {{ achievement.title }}
        </span>
        <span v-if="achievements.length === 0" class="muted-badge">等待第一笔豪购</span>
      </div>
    </div>

    <div class="lab-card">
      <p class="eyebrow">Reality Check</p>
      <ul class="fact-list">
        <li v-for="fact in facts" :key="fact.label">
          <strong>{{ fact.value.toLocaleString('zh-CN') }}</strong>
          <span>{{ fact.label }}</span>
        </li>
      </ul>
    </div>

    <div class="lab-card">
      <p class="eyebrow">Top Category</p>
      <ol class="category-rank">
        <li v-for="category in categories.slice(0, 4)" :key="category.category">
          <span>{{ category.category }}</span>
          <strong>{{ formatCompactCurrency(category.amount) }}</strong>
        </li>
      </ol>
      <p v-if="categories.length === 0" class="empty-line">还没有任何分类消费。</p>
    </div>
  </section>
</template>
