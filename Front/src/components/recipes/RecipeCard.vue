<script setup>
import './RecipeCard.css'

import clockIcon from '../../assets/icons/clock.svg'
import userIcon from '../../assets/icons/user-outline.svg'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

function formattedRating(rating) {
  if (rating === null || rating === undefined) {
    return null
  }

  return Number(rating).toFixed(1).replace('.', ',')
}
</script>

<template>
  <article class="recipe-card">
    <div class="recipe-card-image">
      <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" />

      <span v-else class="recipe-card-image-placeholder"> 📷 </span>
    </div>

    <div class="recipe-card-content">
      <h3>
        {{ recipe.title }}
      </h3>

      <div v-if="recipe.adapted_restrictions?.length" class="recipe-card-adapted">
        <span
          v-for="restriction in recipe.adapted_restrictions"
          :key="restriction.id"
          class="recipe-adapted-badge"
        >
          ✓

          <template v-if="restriction.type === 'allergy'">
            Sin {{ restriction.name.toLowerCase() }}
          </template>

          <template v-else>
            {{ restriction.name }}
          </template>
        </span>
      </div>

      <p v-if="recipe.description" class="recipe-card-description">
        {{ recipe.description }}
      </p>

      <div class="recipe-card-meta">
        <span v-if="recipe.preparation_time !== null" class="recipe-card-meta-item">
          <img :src="clockIcon" alt="" class="recipe-card-meta-icon" />

          {{ recipe.preparation_time }} min
        </span>

        <span v-if="recipe.author" class="recipe-card-meta-item">
          <img :src="userIcon" alt="" class="recipe-card-meta-icon" />

          {{ recipe.author }}
        </span>
      </div>

      <div class="recipe-card-footer">
        <div class="recipe-card-rating">
          <template v-if="formattedRating(recipe.average_rating) !== null">
            <span class="recipe-rating-star"> ★ </span>

            <span class="recipe-rating-value">
              {{ formattedRating(recipe.average_rating) }}
            </span>

            <span class="recipe-rating-count"> ({{ recipe.review_count }}) </span>
          </template>

          <span v-else class="recipe-no-rating"> Sin valoraciones </span>
        </div>

        <button type="button" class="recipe-view-button" @click="$emit('select', recipe)">
          Ver

          <span> › </span>
        </button>
      </div>
    </div>
  </article>
</template>
