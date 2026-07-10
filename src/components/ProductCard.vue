<script setup>
import { formatCompactCurrency, formatCurrency } from '../utils/money'
import { handleProductImageError, resolveProductImage } from '../utils/productImage'

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

defineEmits(['buy', 'buyMany', 'buyMax', 'remove'])

const fallbackImage = resolveProductImage('/products/fallback.webp')
</script>

<template>
  <article class="product-card">
    <div class="product-image-wrap">
      <img
        :src="resolveProductImage(product.image)"
        :alt="product.name"
        loading="lazy"
        @error="handleProductImageError($event, fallbackImage)"
      />
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
      <div class="quick-buy-row">
        <button type="button" :disabled="disabled" @click="$emit('buyMany', product.id, 10)">+10</button>
        <button type="button" :disabled="disabled" @click="$emit('buyMax', product.id)">买到买不起</button>
      </div>
    </div>
  </article>
</template>
