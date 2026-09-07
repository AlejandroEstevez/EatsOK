<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import './EstablishmentDetailView.css'

import NavBar from '../components/common/NavBar.vue'
import ReviewSection from '../components/reviews/ReviewSection.vue'

import { useAuthStore } from '../stores/auth'
import api from '../services/api'

import pinIcon from '../assets/icons/pin.svg'
import clockIcon from '../assets/icons/clock.svg'
import telephoneIcon from '../assets/icons/telephone.svg'
import warningIcon from '../assets/icons/warning.svg'
import editIcon from '../assets/icons/edit.svg'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const establishment = ref(null)
const loading = ref(true)
const error = ref('')
const dishFilter = ref('all')

const canEdit = computed(() => {
  return authStore.user?.role === 'OWNER' && establishment.value?.owner === authStore.user?.username
})

function formatTime(time) {
  if (!time) {
    return ''
  }

  return time.slice(0, 5)
}

const availableDishes = computed(() => {
  if (!establishment.value) {
    return []
  }

  return establishment.value.dishes.filter((dish) => dish.available)
})

const filteredDishes = computed(() => {
  if (dishFilter.value === 'compatible') {
    return availableDishes.value.filter((dish) => dish.is_compatible)
  }

  return availableDishes.value
})

async function loadEstablishment() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(`/establishments/${route.params.id}/`)

    establishment.value = response.data
  } catch (err) {
    console.error('Error loading establishment:', err)

    error.value = 'No se ha podido cargar el establecimiento.'
  } finally {
    loading.value = false
  }
}

function editEstablishment() {
  router.push({
    name: 'establishment-edit',
    params: {
      id: establishment.value.id,
    },
  })
}

function compatibilityLabel(percentage) {
  if (percentage >= 80) {
    return 'Alta'
  }

  if (percentage >= 40) {
    return 'Media'
  }

  return 'Baja'
}

function compatibilityClass(percentage) {
  if (percentage >= 80) {
    return 'compatibility-high'
  }

  if (percentage >= 40) {
    return 'compatibility-medium'
  }

  return 'compatibility-low'
}

onMounted(() => {
  loadEstablishment()
})
</script>

<template>
  <div class="establishment-detail-page">
    <NavBar />

    <main class="establishment-detail-content">
      <p v-if="loading">Cargando establecimiento...</p>

      <p v-else-if="error">
        {{ error }}
      </p>

      <template v-else-if="establishment">
        <section class="establishment-detail-header">
          <div class="establishment-detail-image">
            <img
              v-if="establishment.image_url"
              :src="establishment.image_url"
              :alt="establishment.name"
            />
          </div>

          <div class="establishment-detail-content-area">
            <div class="establishment-detail-top">
              <div class="establishment-detail-main">
                <div class="establishment-title-row">
                  <h1>
                    {{ establishment.name }}
                  </h1>

                  <button
                    v-if="canEdit"
                    type="button"
                    class="establishment-edit-button"
                    @click="editEstablishment"
                  >
                    <img :src="editIcon" alt="" />

                    Editar
                  </button>
                </div>

                <p v-if="establishment.tag_details?.length" class="establishment-detail-tags">
                  <template v-for="(tag, index) in establishment.tag_details" :key="tag.id">
                    <span>
                      {{ tag.name }}
                    </span>

                    <span v-if="index < establishment.tag_details.length - 1" class="tag-separator">
                      ·
                    </span>
                  </template>
                </p>

                <p class="establishment-detail-description">
                  {{ establishment.description }}
                </p>

                <p v-if="establishment.restrictions_info" class="establishment-detail-restrictions">
                  {{ establishment.restrictions_info }}
                </p>
              </div>

              <aside class="establishment-detail-side">
                <div
                  class="compatibility-badge"
                  :class="compatibilityClass(establishment.compatible_percentage)"
                >
                  Compatibilidad
                  {{ compatibilityLabel(establishment.compatible_percentage) }}:
                  {{ establishment.compatible_percentage }}%
                </div>

                <div v-if="establishment.cross_contamination" class="cross-contamination">
                  <div class="cross-contamination-title">
                    <img :src="warningIcon" alt="" class="cross-contamination-icon" />

                    <strong> Contaminación cruzada </strong>
                  </div>

                  <p>
                    {{ establishment.cross_contamination }}
                  </p>
                </div>
              </aside>
            </div>

            <div class="establishment-detail-info">
              <div class="detail-info-item">
                <img :src="pinIcon" alt="" class="detail-info-icon" />

                <div>
                  <p>
                    {{ establishment.location.address }}
                  </p>

                  <p>
                    {{ establishment.location.postal_code }}
                    {{ establishment.location.city }}
                  </p>
                </div>
              </div>

              <div class="detail-info-item">
                <img :src="clockIcon" alt="" class="detail-info-icon" />

                <div>
                  <p class="detail-info-title">Horario</p>

                  <p>
                    {{ formatTime(establishment.opening_time) }}
                    -
                    {{ formatTime(establishment.closing_time) }}
                  </p>
                </div>
              </div>

              <div class="detail-info-item">
                <img :src="telephoneIcon" alt="" class="detail-info-icon" />

                <div>
                  <p v-if="establishment.phone">
                    {{ establishment.phone }}
                  </p>

                  <p v-if="establishment.email">
                    {{ establishment.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="establishment-detail-lower">
          <div class="establishment-dishes">
            <div class="dishes-header">
              <h2>Platos disponibles</h2>

              <div class="dish-filters">
                <button
                  type="button"
                  class="dish-filter-button"
                  :class="{
                    'dish-filter-button--active': dishFilter === 'compatible',
                  }"
                  @click="dishFilter = 'compatible'"
                >
                  Compatibles
                </button>

                <button
                  type="button"
                  class="dish-filter-button"
                  :class="{
                    'dish-filter-button--active': dishFilter === 'all',
                  }"
                  @click="dishFilter = 'all'"
                >
                  Todos
                </button>
              </div>
            </div>

            <div v-if="filteredDishes.length" class="dish-grid">
              <article v-for="dish in filteredDishes" :key="dish.id" class="dish-card">
                <div class="dish-card-image">
                  <img v-if="dish.image_url" :src="dish.image_url" :alt="dish.name" />
                </div>

                <div class="dish-card-content">
                  <h3>
                    {{ dish.name }}
                  </h3>

                  <p class="dish-description">
                    {{ dish.description }}
                  </p>

                  <div class="dish-compatibility">
                    <span v-if="dish.is_compatible" class="dish-compatible-badge">
                      ✓ Compatible
                    </span>

                    <template v-else>
                      <span
                        v-for="restriction in dish.conflicting_restrictions"
                        :key="restriction.id"
                        class="dish-restriction-badge"
                      >
                        {{ restriction.name }}
                      </span>
                    </template>
                  </div>

                  <div class="dish-card-footer">
                    <strong v-if="dish.price" class="dish-price"> {{ dish.price }} € </strong>

                    <img
                      v-if="!dish.is_compatible"
                      :src="warningIcon"
                      alt="Plato no compatible"
                      class="dish-warning-icon"
                    />
                  </div>
                </div>
              </article>
            </div>

            <p v-else class="dishes-empty">No hay platos disponibles para este filtro.</p>
          </div>

          <ReviewSection target-type="establishment" :target-id="establishment.id" />
        </section>
      </template>
    </main>

    <p class="establishment-detail-slogan">Everyone can tag along</p>
  </div>
</template>
