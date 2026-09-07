<script setup>
import './ExploreCard.css'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'green',
  },
})
</script>

<template>
  <article :class="['explore-card', `explore-card--${variant}`]">
    <div class="card-content">
      <div class="card-title">
        <div :class="['round-icon', variant]">
          <img :src="icon" alt="" class="card-title-icon" />
        </div>

        <h3>{{ title }}</h3>
      </div>

      <p class="card-description">
        {{ description }}
      </p>

      <button :class="['card-button', variant]">
        {{ buttonText }}
        <span>›</span>
      </button>
    </div>

    <div class="card-image"></div>
  </article>
</template>
