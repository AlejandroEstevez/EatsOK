<script setup>
import { computed, onMounted, ref } from 'vue'

import api from '../services/api'

import NavBar from '../components/common/NavBar.vue'
import RestrictionCard from '../components/food-profile/RestrictionCard.vue'

import background from '../assets/home/home-background.png'

import './FoodProfileView.css'

const restrictions = ref([])
const selectedRestrictionIds = ref([])

const loading = ref(true)
const saving = ref(false)

const error = ref('')
const showSuccess = ref(false)

const allergies = computed(() =>
  restrictions.value.filter((restriction) => restriction.type === 'allergy')
)

const diets = computed(() =>
  restrictions.value.filter((restriction) => restriction.type === 'diet')
)

const selectedRestrictions = computed(() =>
  restrictions.value.filter((restriction) => selectedRestrictionIds.value.includes(restriction.id))
)

const loadFoodProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    const [restrictionsResponse, profileResponse] = await Promise.all([
      api.get('/food-profiles/restrictions/'),
      api.get('/food-profiles/'),
    ])

    restrictions.value = restrictionsResponse.data

    selectedRestrictionIds.value = profileResponse.data.restrictions.map(
      (restriction) => restriction.id
    )
  } catch {
    error.value = 'No se ha podido cargar tu perfil alimentario.'
  } finally {
    loading.value = false
  }
}

const toggleRestriction = (restrictionId) => {
  if (selectedRestrictionIds.value.includes(restrictionId)) {
    selectedRestrictionIds.value = selectedRestrictionIds.value.filter((id) => id !== restrictionId)

    return
  }

  selectedRestrictionIds.value.push(restrictionId)
}

const saveProfile = async () => {
  saving.value = true
  error.value = ''

  try {
    await api.patch('/food-profiles/', {
      restriction_ids: selectedRestrictionIds.value,
    })

    showSuccess.value = true
  } catch {
    error.value = 'No se han podido guardar los cambios.'
  } finally {
    saving.value = false
  }
}

onMounted(loadFoodProfile)
</script>

<template>
  <div class="food-profile-page" :style="{ backgroundImage: `url(${background})` }">
    <NavBar />

    <main class="food-profile-main">
      <header class="food-profile-title">
        <h1>Mi perfil alimentario</h1>

        <p class="food-profile-description">
          Selecciona tus alergias, intolerancias y preferencias alimentarias para adaptar
          establecimientos, platos y recetas a tus necesidades.
        </p>
      </header>

      <p v-if="error" class="profile-error" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="profile-loading">Cargando perfil...</div>

      <template v-else>
        <section class="profile-summary">
          <div class="summary-content">
            <h2>Resumen del perfil</h2>

            <div v-if="selectedRestrictions.length" class="summary-restrictions">
              <RestrictionCard
                v-for="restriction in selectedRestrictions"
                :key="restriction.id"
                :restriction="restriction"
                :selected="true"
                :summary="true"
                @toggle="toggleRestriction"
              />
            </div>

            <p v-else class="empty-profile">Todavía no has seleccionado ninguna restricción.</p>
          </div>

          <button type="button" class="save-profile-button" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </section>

        <div class="profile-options">
          <section class="restrictions-section">
            <h2>Alergias e intolerancias</h2>

            <div class="allergies-grid">
              <RestrictionCard
                v-for="restriction in allergies"
                :key="restriction.id"
                :restriction="restriction"
                :selected="selectedRestrictionIds.includes(restriction.id)"
                @toggle="toggleRestriction"
              />
            </div>
          </section>

          <section class="restrictions-section diets-section">
            <h2>Dietas</h2>

            <div class="diets-grid">
              <RestrictionCard
                v-for="restriction in diets"
                :key="restriction.id"
                :restriction="restriction"
                :selected="selectedRestrictionIds.includes(restriction.id)"
                @toggle="toggleRestriction"
              />
            </div>
          </section>
        </div>
      </template>
    </main>

    <p class="food-profile-slogan">Everyone can tag along</p>

    <div v-if="showSuccess" class="profile-modal-overlay" @click.self="showSuccess = false">
      <div class="profile-modal">
        <h3>Perfil actualizado</h3>

        <p>Tus preferencias alimentarias se han guardado correctamente.</p>

        <button type="button" @click="showSuccess = false">OK</button>
      </div>
    </div>
  </div>
</template>
