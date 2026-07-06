<script setup>
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import CartPanel from './components/CartPanel.vue'
import CelebrationOverlay from './components/CelebrationOverlay.vue'
import GameLab from './components/GameLab.vue'
import ProductCard from './components/ProductCard.vue'
import StatsPanel from './components/StatsPanel.vue'
import { INITIAL_NET_WORTH } from './stores/spendingCore'
import { useSpendingStore } from './stores/spendingStore'

const store = useSpendingStore()
const search = ref('')
const selectedCategory = ref('全部')

const categories = computed(() => ['全部', ...new Set(store.products.map((product) => product.category))])

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  return store.products.filter((product) => {
    const matchesCategory =
      selectedCategory.value === '全部' || product.category === selectedCategory.value
    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <div class="app-shell">
    <AppHeader :remaining="store.remaining" :spent="store.spent" :percent="store.spendPercent" />

    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">Net worth simulator</p>
          <h2>从一杯咖啡到整套航天计划，看看 1.1 万亿美元到底有多难花完。</h2>
        </div>
        <StatsPanel
          :initial-balance="INITIAL_NET_WORTH"
          :remaining="store.remaining"
          :spent="store.spent"
          :percent="store.spendPercent"
          :total-items="store.totalItems"
        />
      </section>

      <GameLab
        :title="store.spendingTitle"
        :mission="store.featuredMission"
        :milestone="store.milestoneState"
        :achievements="store.achievements"
        :facts="store.comparisonFacts"
        :categories="store.categorySpend"
        :spree-count="store.spreeCount"
        :latest-purchase="store.latestPurchase"
        :surprise-event="store.surpriseEvent"
      />

      <section class="toolbar" aria-label="商品筛选">
        <label>
          <span>搜索</span>
          <input v-model="search" type="search" placeholder="手机、豪宅、火箭..." />
        </label>
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </section>

      <div class="content-layout">
        <section class="product-grid" aria-label="商品列表">
          <TransitionGroup name="product" tag="div" class="grid-inner">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :quantity="store.quantityFor(product.id)"
              :disabled="!store.canBuy(product)"
              @buy="store.buy"
              @buy-many="store.buyMany"
              @buy-max="store.buyMax"
              @remove="store.remove"
            />
          </TransitionGroup>
        </section>
        <CartPanel :items="store.purchasedItems" @remove="store.remove" />
      </div>
    </main>

    <Transition name="toast">
      <div v-if="store.state.notice" class="toast" role="status">{{ store.state.notice }}</div>
    </Transition>

    <CelebrationOverlay :show="store.isFinished" @reset="store.reset" />
  </div>
</template>
