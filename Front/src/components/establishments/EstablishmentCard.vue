<script setup>
import './EstablishmentCard.css'

import establishmentImage from '../../assets/images/establishment-demo.jpg'

defineProps({
  establishment: {
    type: Object,
    required: true,
  },
})

defineEmits(['select', 'hover', 'leave'])

function getCompatibilityLevel(percentage) {
  if (percentage >= 80) {
    return {
      className: 'high',
      label: 'Alta',
    }
  }

  if (percentage >= 40) {
    return {
      className: 'medium',
      label: 'Media',
    }
  }

  return {
    className: 'low',
    label: 'Baja',
  }
}
</script>

<template>
  <article
    class="establishment-card"
    @click="$emit('select', establishment)"
    @mouseenter="$emit('hover', establishment.id)"
    @mouseleave="$emit('leave')"
  >
    <img class="establishment-card-image" :src="establishmentImage" :alt="establishment.name" />

    <div class="establishment-card-content">
      <div class="establishment-card-header">
        <h3>
          {{ establishment.name }}
        </h3>

        <span
          class="compatibility-badge"
          :class="`compatibility-badge--${
            getCompatibilityLevel(establishment.compatible_percentage).className
          }`"
        >
          {{ getCompatibilityLevel(establishment.compatible_percentage).label }}

          {{ Math.round(establishment.compatible_percentage) }}%
        </span>
      </div>

      <div class="establishment-card-meta">
        <span v-if="establishment.average_rating !== null" class="establishment-rating">
          ★ {{ Number(establishment.average_rating).toFixed(1) }}
          <span class="establishment-review-count"> ({{ establishment.review_count }}) </span>
        </span>

        <span v-else> Sin valoraciones </span>

        <span v-if="establishment.distance !== null"> · {{ establishment.distance }} km </span>
      </div>

      <p v-if="establishment.tags?.length" class="establishment-card-tags">
        <template v-for="(tag, index) in establishment.tags" :key="tag.id">
          <span>{{ tag.name }}</span>
          <span v-if="index < establishment.tags.length - 1"> · </span>
        </template>
      </p>

      <p class="establishment-card-dishes">
        <strong>
          {{ establishment.compatible_dishes }}
        </strong>

        de

        <strong>
          {{ establishment.total_dishes }}
        </strong>

        platos compatibles
      </p>
    </div>

    <span class="establishment-card-arrow"> › </span>
  </article>
</template>
