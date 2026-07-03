<script setup>
import { formatCompactCurrency } from '../utils/money'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

defineEmits(['remove'])
</script>

<template>
  <aside class="cart-panel" aria-label="已购买清单">
    <div class="panel-heading">
      <p class="eyebrow">Purchased</p>
      <h2>购物清单</h2>
    </div>
    <div v-if="items.length === 0" class="empty-cart">先从一台手机开始，也可以直接买火箭。</div>
    <ul v-else class="cart-list">
      <li v-for="item in items" :key="item.id">
        <div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.quantity }} × {{ formatCompactCurrency(item.price) }}</span>
        </div>
        <button type="button" @click="$emit('remove', item.id)">-</button>
      </li>
    </ul>
  </aside>
</template>
