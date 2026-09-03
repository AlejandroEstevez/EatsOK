<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

import ReviewModal from './ReviewModal.vue'
import StarRating from './StarRating.vue'


const authStore = useAuthStore()

const props = defineProps({
  targetType: {
    type: String,
    required: true,
    validator: value => [
      'establishment',
      'recipe',
    ].includes(value),
  },

  targetId: {
    type: [
      Number,
      String,
    ],
    required: true,
  },
})

const reviews = ref([])
const loading = ref(false)

const modalOpen = ref(false)
const submitting = ref(false)
const submitError = ref('')

const hidingReviewId = ref(null)

const isAdmin = computed(() => {
  return authStore.user?.role === 'ADMIN'
})

const averageRating = computed(() => {
  if (!reviews.value.length) {
    return 0
  }

  const total = reviews.value.reduce(
    (sum, review) => {
      return sum + Number(review.rating)
    },
    0
  )

  return total / reviews.value.length
})

const formattedAverageRating = computed(() => {
  return averageRating.value
    .toFixed(1)
    .replace('.', ',')
})

async function loadReviews() {
  if (!props.targetId) {
    return
  }

  loading.value = true

  try {
    const response = await api.get(
      '/reviews/',
      {
        params: {
          [props.targetType]:
            props.targetId,
        },
      }
    )

    reviews.value = response.data
  } catch (error) {
    console.error(
      'Error loading reviews:',
      error
    )

    reviews.value = []
  } finally {
    loading.value = false
  }
}

function openModal() {
  submitError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (submitting.value) {
    return
  }

  modalOpen.value = false
  submitError.value = ''
}

async function submitReview({
  rating,
  comment,
}) {
  submitting.value = true
  submitError.value = ''

  try {
    await api.post(
      '/reviews/',
      {
        [props.targetType]:
          props.targetId,
        rating,
        comment,
      }
    )

    modalOpen.value = false

    await loadReviews()
  } catch (error) {
    console.error(
      'Error creating review:',
      error
    )

    submitError.value = parseReviewError(
      error
    )
  } finally {
    submitting.value = false
  }
}

async function hideReview(review) {
  const confirmed = window.confirm(
    '¿Seguro que quieres ocultar esta reseña?'
  )

  if (!confirmed) {
    return
  }

  hidingReviewId.value = review.id

  try {
    await api.patch(
      `/reviews/${review.id}/moderation/`,
      {
        visible: false,
      }
    )

    reviews.value = reviews.value.filter(
      item => item.id !== review.id
    )
  } catch (error) {
    console.error(
      'Error hiding review:',
      error
    )
  } finally {
    hidingReviewId.value = null
  }
}

function parseReviewError(error) {
  const data = error.response?.data

  if (typeof data === 'string') {
    return data
  }

  if (
    Array.isArray(
      data?.non_field_errors
    )
  ) {
    return data.non_field_errors[0]
  }

  if (Array.isArray(data?.rating)) {
    return data.rating[0]
  }

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  return 'No se ha podido publicar la reseña.'
}

function authorInitial(author) {
  if (!author) {
    return '?'
  }

  return author
    .charAt(0)
    .toUpperCase()
}

function formatRelativeDate(date) {
  if (!date) {
    return ''
  }

  const publicationDate = new Date(date)
  const now = new Date()

  const difference =
    now - publicationDate

  const minutes = Math.floor(
    difference
    / (1000 * 60)
  )

  const hours = Math.floor(
    difference
    / (1000 * 60 * 60)
  )

  const days = Math.floor(
    difference
    / (1000 * 60 * 60 * 24)
  )

  if (minutes < 1) {
    return 'Ahora'
  }

  if (minutes < 60) {
    return `Hace ${minutes} ${
      minutes === 1
        ? 'minuto'
        : 'minutos'
    }`
  }

  if (hours < 24) {
    return `Hace ${hours} ${
      hours === 1
        ? 'hora'
        : 'horas'
    }`
  }

  if (days < 7) {
    return `Hace ${days} ${
      days === 1
        ? 'día'
        : 'días'
    }`
  }

  if (days < 30) {
    const weeks = Math.floor(
      days / 7
    )

    return `Hace ${weeks} ${
      weeks === 1
        ? 'semana'
        : 'semanas'
    }`
  }

  if (days < 365) {
    const months = Math.floor(
      days / 30
    )

    return `Hace ${months} ${
      months === 1
        ? 'mes'
        : 'meses'
    }`
  }

  const years = Math.floor(
    days / 365
  )

  return `Hace ${years} ${
    years === 1
      ? 'año'
      : 'años'
  }`
}

watch(
  () => [
    props.targetType,
    props.targetId,
  ],
  () => {
    loadReviews()
  }
)

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <section class="review-section">
    <h2>
      Valoraciones y reseñas
    </h2>

    <div class="reviews-summary">
      <div class="reviews-rating">
        <strong class="reviews-average">
          {{ formattedAverageRating }}
        </strong>

        <div>
          <StarRating
            :rating="averageRating"
          />

          <p class="reviews-count">
            {{ reviews.length }}
            {{
              reviews.length === 1
                ? 'valoración'
                : 'valoraciones'
            }}
          </p>
        </div>
      </div>

      <button
        v-if="authStore.user?.role === 'CLIENT'"
        type="button"
        class="write-review-button"
        @click="openModal"
      >
        ✎ Escribir
      </button>
    </div>

    <div class="reviews-divider" />

    <p
      v-if="loading"
      class="reviews-state"
    >
      Cargando reseñas...
    </p>

    <p
      v-else-if="!reviews.length"
      class="reviews-state"
    >
      Aún no hay reseñas.
    </p>

    <div
      v-else
      class="reviews-list"
    >
      <article
        v-for="review in reviews"
        :key="review.id"
        class="review-item"
      >
        <div class="review-avatar">
          {{ authorInitial(
            review.author
          ) }}
        </div>

        <div class="review-content">
          <div class="review-header">
            <strong class="review-author">
              {{ review.author }}
            </strong>

            <StarRating
              :rating="Number(
                review.rating
              )"
              size="small"
            />

            <span class="review-date">
              {{ formatRelativeDate(
                review.publication_date
              ) }}
            </span>

            <button
              v-if="isAdmin"
              type="button"
              class="hide-review-button"
              :disabled="
                hidingReviewId === review.id
              "
              @click="hideReview(review)"
            >
              {{
                hidingReviewId === review.id
                  ? 'Ocultando...'
                  : 'Ocultar'
              }}
            </button>
          </div>

          <p
            v-if="review.comment"
            class="review-comment"
          >
            {{ review.comment }}
          </p>
        </div>
      </article>
    </div>

    <ReviewModal
      :open="modalOpen"
      :submitting="submitting"
      :error="submitError"
      @close="closeModal"
      @submit="submitReview"
    />
  </section>
</template>

<style src="./ReviewSection.css"></style>
