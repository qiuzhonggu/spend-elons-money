<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { formatCompactCurrency, formatCurrency } from '../utils/money'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  suffix: {
    type: String,
    default: '',
  },
})

const displayValue = ref(props.value)
let frame = 0

function animateTo(nextValue) {
  cancelAnimationFrame(frame)
  const startValue = displayValue.value
  const start = performance.now()
  const duration = 520

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValue.value = startValue + (nextValue - startValue) * eased
    if (progress < 1) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
}

watch(
  () => props.value,
  (nextValue) => animateTo(nextValue),
)

onMounted(() => {
  displayValue.value = props.value
})

const formatted = computed(() => {
  if (props.suffix) return `${displayValue.value.toFixed(1)}${props.suffix}`
  return props.compact
    ? formatCompactCurrency(displayValue.value)
    : formatCurrency(displayValue.value)
})
</script>

<template>
  <span>{{ formatted }}</span>
</template>
