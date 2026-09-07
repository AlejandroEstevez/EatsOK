<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    default: 'normal',
  },
})

function starFill(index) {
  const value = props.rating - (index - 1)

  if (value >= 1) {
    return 100
  }

  if (value <= 0) {
    return 0
  }

  return value * 100
}

function starStyle(index) {
  const fill = starFill(index)

  return {
    background: `
      linear-gradient(
        90deg,
        var(--orange) ${fill}%,
        #c7c7c7 ${fill}%
      )
    `,
  }
}
</script>

<template>
  <div class="star-rating" :class="`star-rating--${size}`">
    <span v-for="star in 5" :key="star" class="star-rating-star" :style="starStyle(star)"> ★ </span>
  </div>
</template>

<style src="./StarRating.css"></style>
