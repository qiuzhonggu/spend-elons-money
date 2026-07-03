<script setup>
import { formatCompactCurrency, formatCurrency } from '../utils/money'

defineProps({
  product: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['buy', 'remove'])
</script>

<template>
  <article class="product-card">
    <div class="product-image-wrap">
      <img :src="product.image" :alt="product.name" loading="lazy" />
      <span>{{ product.category }}</span>
    </div>
    <div class="product-content">
      <div class="product-title-row">
        <h3>{{ product.name }}</h3>
        <strong>{{ formatCompactCurrency(product.price) }}</strong>
      </div>
      <p>{{ product.description }}</p>
      <div class="product-footer">
        <span class="full-price">{{ formatCurrency(product.price) }}</span>
        <div class="quantity-control" :aria-label="`${product.name} 数量控制`">
          <button type="button" :disabled="quantity === 0" @click="$emit('remove', product.id)">-</button>
          <span>{{ quantity }}</span>
          <button type="button" :disabled="disabled" @click="$emit('buy', product.id)">+</button>
        </div>
      </div>
      <button class="buy-button" type="button" :disabled="disabled" @click="$emit('buy', product.id)">
        {{ disabled ? '余额不足' : '购买' }}
      </button>
    </div>
  </article>
</template>
