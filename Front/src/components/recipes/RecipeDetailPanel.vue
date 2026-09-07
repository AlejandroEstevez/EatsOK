<script setup>
import './RecipeDetailPanel.css'

import clockIcon from '../../assets/icons/clock.svg'
import userIcon from '../../assets/icons/user.svg'

import ReviewSection from '../reviews/ReviewSection.vue'

defineProps({
  recipe: {
    type: Object,
    default: null,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: '',
  },

  canManage: {
    type: Boolean,
    default: false,
  },

  deleting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'edit', 'delete'])

function splitLines(value) {
  if (!value) {
    return []
  }

  return String(value)
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, ''))
}
</script>

<template>
  <Transition name="recipe-detail">
    <div v-if="recipe" class="recipe-detail-overlay" @click="emit('close')">
      <aside class="recipe-detail-panel" @click.stop>
        <div class="recipe-detail-scroll">
          <button type="button" class="recipe-detail-back" @click="emit('close')">
            <span class="recipe-detail-back-arrow"> ‹ </span>

            Volver
          </button>

          <div v-if="loading" class="recipe-detail-loading">Cargando receta...</div>

          <div v-else-if="error" class="recipe-detail-error">
            {{ error }}
          </div>

          <template v-else>
            <div class="recipe-detail-image">
              <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" />

              <span v-else> 📷 </span>
            </div>

            <section class="recipe-detail-header">
              <div class="recipe-detail-title-row">
                <h2>
                  {{ recipe.title }}
                </h2>

                <div v-if="canManage" class="recipe-detail-actions">
                  <button
                    type="button"
                    class="recipe-detail-edit-button"
                    @click="emit('edit', recipe)"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    class="recipe-detail-delete-button"
                    :disabled="deleting"
                    @click="emit('delete', recipe)"
                  >
                    {{ deleting ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </div>
              </div>

              <div class="recipe-detail-meta">
                <span
                  v-if="recipe.preparation_time !== null && recipe.preparation_time !== undefined"
                  class="recipe-detail-meta-item"
                >
                  <img :src="clockIcon" alt="" />

                  {{ recipe.preparation_time }} min
                </span>

                <span v-if="recipe.author" class="recipe-detail-meta-item">
                  <img :src="userIcon" alt="" />

                  {{ recipe.author }}
                </span>
              </div>

              <p v-if="recipe.establishment_name" class="recipe-detail-establishment">
                Receta asociada a
                <strong>
                  {{ recipe.establishment_name }}
                </strong>
              </p>

              <p v-if="recipe.description" class="recipe-detail-description">
                {{ recipe.description }}
              </p>
            </section>

            <section v-if="recipe.adapted_restrictions?.length" class="recipe-detail-adapted">
              <strong> Adaptado para: </strong>

              <div class="recipe-detail-badges">
                <span
                  v-for="restriction in recipe.adapted_restrictions"
                  :key="restriction.id"
                  class="recipe-detail-badge"
                >
                  ✓

                  <template v-if="restriction.type === 'allergy'">
                    Sin
                    {{ restriction.name.toLowerCase() }}
                  </template>

                  <template v-else>
                    {{ restriction.name }}
                  </template>
                </span>
              </div>
            </section>

            <section class="recipe-detail-section">
              <h3>Ingredientes</h3>

              <ul v-if="splitLines(recipe.ingredients).length" class="recipe-detail-list">
                <li v-for="(ingredient, index) in splitLines(recipe.ingredients)" :key="index">
                  {{ ingredient }}
                </li>
              </ul>

              <p v-else class="recipe-detail-empty">No se han indicado ingredientes.</p>
            </section>

            <section class="recipe-detail-section">
              <h3>Pasos</h3>

              <ol v-if="splitLines(recipe.steps).length" class="recipe-detail-steps">
                <li v-for="(step, index) in splitLines(recipe.steps)" :key="index">
                  {{ step }}
                </li>
              </ol>

              <p v-else class="recipe-detail-empty">No se han indicado pasos de elaboración.</p>
            </section>

            <section class="recipe-detail-reviews">
              <ReviewSection target-type="recipe" :target-id="recipe.id" />
            </section>
          </template>
        </div>
      </aside>
    </div>
  </Transition>
</template>
