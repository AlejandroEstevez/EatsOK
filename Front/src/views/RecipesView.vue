<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import './RecipesView.css'

import NavBar from '../components/common/NavBar.vue'
import RecipeFilters from '../components/recipes/RecipeFilters.vue'
import RecipeCard from '../components/recipes/RecipeCard.vue'
import RecipeDetailPanel from '../components/recipes/RecipeDetailPanel.vue'
import RecipeFormPanel from '../components/recipes/RecipeFormPanel.vue'

import api from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const recipes = ref([])
const restrictions = ref([])
const profileRestrictionIds = ref([])

const loading = ref(false)
const error = ref('')

const selectedRecipe = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const deletingRecipe = ref(false)

const recipeFormOpen = ref(false)
const recipeFormMode = ref('create')
const recipeFormRecipe = ref(null)
const recipeFormSaving = ref(false)
const recipeFormError = ref('')

let searchTimeout = null

const filters = reactive({
  search: '',
  useProfile: true,
  selectedRestrictions: [],
  ordering: '-publication_date',
})

const canManageSelectedRecipe = computed(() => {
  if (!selectedRecipe.value || !authStore.user) {
    return false
  }

  return Number(selectedRecipe.value.author_id) === Number(authStore.user.id)
})

async function loadInitialData() {
  try {
    const [restrictionsResponse, profileResponse] = await Promise.all([
      api.get('/food-profiles/restrictions/'),
      api.get('/food-profiles/'),
    ])

    restrictions.value = restrictionsResponse.data

    profileRestrictionIds.value = (profileResponse.data.restrictions ?? []).map((restriction) => {
      if (typeof restriction === 'object' && restriction !== null) {
        return restriction.id
      }

      return restriction
    })

    filters.useProfile = profileResponse.data.enabled

    if (filters.useProfile) {
      filters.selectedRestrictions = [...profileRestrictionIds.value]
    }
  } catch (err) {
    console.error('Error loading recipe filters:', err)

    error.value = 'No se han podido cargar los filtros.'
  }
}

async function searchRecipes() {
  loading.value = true
  error.value = ''

  try {
    const params = {
      search: filters.search,
      use_profile: filters.useProfile,
      ordering: filters.ordering,
    }

    const additionalRestrictions = filters.useProfile
      ? filters.selectedRestrictions.filter(
          (restrictionId) => !profileRestrictionIds.value.includes(restrictionId)
        )
      : filters.selectedRestrictions

    if (additionalRestrictions.length) {
      params.restrictions = additionalRestrictions.join(',')
    }

    const response = await api.get('/search/recipes/', {
      params,
    })

    recipes.value = response.data
  } catch (err) {
    console.error('Error searching recipes:', err)

    recipes.value = []

    error.value = 'No se han podido cargar las recetas.'
  } finally {
    loading.value = false
  }
}

function updateUseProfile(value) {
  filters.useProfile = value

  if (value) {
    filters.selectedRestrictions = [
      ...new Set([...filters.selectedRestrictions, ...profileRestrictionIds.value]),
    ]
  }
}

function toggleRestriction(restrictionId) {
  filters.useProfile = false

  if (filters.selectedRestrictions.includes(restrictionId)) {
    filters.selectedRestrictions = filters.selectedRestrictions.filter((id) => id !== restrictionId)

    return
  }

  filters.selectedRestrictions = [...filters.selectedRestrictions, restrictionId]
}

function replaceRestrictions({ type, selection }) {
  filters.useProfile = false

  const otherTypeIds = restrictions.value
    .filter(
      (restriction) =>
        restriction.type !== type && filters.selectedRestrictions.includes(restriction.id)
    )
    .map((restriction) => restriction.id)

  filters.selectedRestrictions = [...otherTypeIds, ...selection]
}

function clearFilters() {
  filters.search = ''
  filters.useProfile = false
  filters.selectedRestrictions = []
  filters.ordering = '-publication_date'
}

async function selectRecipe(recipe) {
  selectedRecipe.value = recipe
  detailLoading.value = true
  detailError.value = ''

  try {
    const response = await api.get(`/recipes/${recipe.id}/`)

    if (selectedRecipe.value?.id !== recipe.id) {
      return
    }

    selectedRecipe.value = {
      ...recipe,
      ...response.data,
    }
  } catch (err) {
    console.error('Error loading recipe detail:', err)

    if (selectedRecipe.value?.id === recipe.id) {
      detailError.value = 'No se ha podido cargar el detalle de la receta.'
    }
  } finally {
    if (selectedRecipe.value?.id === recipe.id) {
      detailLoading.value = false
    }
  }
}

function closeRecipeDetail() {
  selectedRecipe.value = null
  detailLoading.value = false
  detailError.value = ''
  deletingRecipe.value = false
}

function openCreateRecipe() {
  closeRecipeDetail()

  recipeFormMode.value = 'create'
  recipeFormRecipe.value = null
  recipeFormError.value = ''
  recipeFormOpen.value = true
}

function openEditRecipe(recipe) {
  const recipeToEdit = {
    ...recipe,
  }

  closeRecipeDetail()

  recipeFormMode.value = 'edit'
  recipeFormRecipe.value = recipeToEdit
  recipeFormError.value = ''
  recipeFormOpen.value = true
}

function closeRecipeForm() {
  recipeFormOpen.value = false
  recipeFormRecipe.value = null
  recipeFormSaving.value = false
  recipeFormError.value = ''
}

async function saveRecipe(payload) {
  recipeFormSaving.value = true
  recipeFormError.value = ''

  try {
    if (recipeFormMode.value === 'edit' && recipeFormRecipe.value) {
      await api.patch(`/recipes/${recipeFormRecipe.value.id}/`, payload)
    } else {
      await api.post('/recipes/', payload)
    }

    closeRecipeForm()

    await searchRecipes()
  } catch (err) {
    console.error('Error saving recipe:', err)

    recipeFormError.value = getApiError(err, 'No se ha podido guardar la receta.')
  } finally {
    recipeFormSaving.value = false
  }
}

async function deleteRecipe(recipe) {
  const confirmed = window.confirm(`¿Seguro que quieres eliminar "${recipe.title}"?`)

  if (!confirmed) {
    return
  }

  deletingRecipe.value = true

  try {
    await api.delete(`/recipes/${recipe.id}/`)

    closeRecipeDetail()

    await searchRecipes()
  } catch (err) {
    console.error('Error deleting recipe:', err)

    detailError.value = getApiError(err, 'No se ha podido eliminar la receta.')
  } finally {
    deletingRecipe.value = false
  }
}

function getApiError(err, fallback) {
  const data = err.response?.data

  if (!data) {
    return fallback
  }

  if (typeof data === 'string') {
    return data
  }

  if (data.detail) {
    return data.detail
  }

  const firstValue = Object.values(data)[0]

  if (Array.isArray(firstValue)) {
    return firstValue[0]
  }

  if (typeof firstValue === 'string') {
    return firstValue
  }

  return fallback
}

function handleKeydown(event) {
  if (event.key !== 'Escape') {
    return
  }

  if (recipeFormOpen.value) {
    closeRecipeForm()
    return
  }

  if (selectedRecipe.value) {
    closeRecipeDetail()
  }
}

watch(
  () => [
    filters.search,
    filters.useProfile,
    filters.ordering,
    filters.selectedRestrictions.join(','),
  ],
  () => {
    clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
      searchRecipes()
    }, 250)
  }
)

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  await loadInitialData()
  await searchRecipes()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)

  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="recipes-page">
    <NavBar />

    <div class="recipes-body">
      <main class="recipes-layout">
        <RecipeFilters
          :search="filters.search"
          :use-profile="filters.useProfile"
          :restrictions="restrictions"
          :selected-restrictions="filters.selectedRestrictions"
          @update:search="filters.search = $event"
          @update:use-profile="updateUseProfile"
          @toggle-restriction="toggleRestriction"
          @replace-restrictions="replaceRestrictions"
          @clear="clearFilters"
        />

        <section class="recipes-main">
          <div class="recipes-heading">
            <div>
              <h1>Recetas adaptadas</h1>

              <p class="recipes-subtitle">
                Encuentra recetas compatibles con tus restricciones alimentarias.
              </p>
            </div>

            <button type="button" class="recipes-create-button" @click="openCreateRecipe">
              <span> + </span>

              Crear
            </button>
          </div>

          <div class="recipes-results">
            <div class="recipes-results-header">
              <strong>
                {{ recipes.length }}
                {{ recipes.length === 1 ? 'receta encontrada' : 'recetas encontradas' }}
              </strong>

              <select v-model="filters.ordering" class="recipes-ordering">
                <option value="-publication_date">Más reciente</option>

                <option value="-rating">Mejor valoradas</option>

                <option value="preparation_time">Menor tiempo</option>

                <option value="-preparation_time">Mayor tiempo</option>
              </select>
            </div>

            <p v-if="loading" class="recipes-state">Cargando recetas...</p>

            <p v-else-if="error" class="recipes-state recipes-state--error">
              {{ error }}
            </p>

            <p v-else-if="!recipes.length" class="recipes-state">
              No se han encontrado recetas con estos filtros.
            </p>

            <div v-else class="recipes-grid">
              <RecipeCard
                v-for="recipe in recipes"
                :key="recipe.id"
                :recipe="recipe"
                @select="selectRecipe"
              />
            </div>
          </div>

          <p class="recipes-slogan">Everyone can tag along</p>
        </section>
      </main>

      <RecipeDetailPanel
        :recipe="selectedRecipe"
        :loading="detailLoading"
        :error="detailError"
        :can-manage="canManageSelectedRecipe"
        :deleting="deletingRecipe"
        @close="closeRecipeDetail"
        @edit="openEditRecipe"
        @delete="deleteRecipe"
      />

      <RecipeFormPanel
        :open="recipeFormOpen"
        :mode="recipeFormMode"
        :recipe="recipeFormRecipe"
        :restrictions="restrictions"
        :saving="recipeFormSaving"
        :error="recipeFormError"
        @close="closeRecipeForm"
        @submit="saveRecipe"
      />
    </div>
  </div>
</template>
