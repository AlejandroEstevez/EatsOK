<script setup>
import { ref, watch } from 'vue'

import StarRating from './StarRating.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'submit'])

const rating = ref(0)
const comment = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) {
      rating.value = 0
      comment.value = ''
    }
  }
)

function formatRating(value) {
  return Number(value).toFixed(1)
}

function submit() {
  emit('submit', {
    rating: Number(rating.value),
    comment: comment.value.trim(),
  })
}
</script>

<template>
  <div v-if="open" class="review-modal-backdrop" @click.self="emit('close')">
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div class="review-modal-header">
        <h2 id="review-modal-title">Escribir reseña</h2>

        <button
          type="button"
          class="review-modal-close"
          aria-label="Cerrar"
          :disabled="submitting"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="review-modal-body">
        <div class="review-rating-field">
          <div class="review-rating-heading">
            <label for="review-rating"> Tu valoración </label>

            <strong>
              {{ formatRating(rating) }}
            </strong>
          </div>

          <StarRating :rating="Number(rating)" size="large" />

          <input
            id="review-rating"
            v-model.number="rating"
            class="review-rating-slider"
            type="range"
            min="0"
            max="5"
            step="0.1"
          />

          <div class="review-rating-scale">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        <div class="review-comment-field">
          <label for="review-comment">
            Comentario
            <span>(opcional)</span>
          </label>

          <textarea
            id="review-comment"
            v-model="comment"
            rows="5"
            placeholder="Cuéntanos tu experiencia..."
          />
        </div>

        <p v-if="error" class="review-modal-error">
          {{ error }}
        </p>
      </div>

      <div class="review-modal-actions">
        <button
          type="button"
          class="review-modal-cancel"
          :disabled="submitting"
          @click="emit('close')"
        >
          Cancelar
        </button>

        <button type="button" class="review-modal-submit" :disabled="submitting" @click="submit">
          {{ submitting ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style src="./ReviewModal.css"></style>
