<script setup>
import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'

import './RecipesView.css'

import NavBar from '../components/common/NavBar.vue'
import RecipeFilters from '../components/recipes/RecipeFilters.vue'
import RecipeCard from '../components/recipes/RecipeCard.vue'

import api from '../services/api.js'

const recipes = ref([])
const restrictions = ref([])
const profileRestrictionIds = ref([])

const loading = ref(false)
const error = ref('')

let searchTimeout = null

const filters = reactive({
  search: '',
  useProfile: true,
  selectedRestrictions: [],
  ordering: '-publication_date',
})

async function loadInitialData() {
  try {
    const [
      restrictionsResponse,
      profileResponse,
    ] = await Promise.all([
      api.get(
        '/food-profiles/restrictions/'
      ),
      api.get(
        '/food-profiles/'
      ),
    ])

    restrictions.value =
      restrictionsResponse.data

    profileRestrictionIds.value = (
      profileResponse.data.restrictions ?? []
    ).map(restriction => {
      if (
        typeof restriction === 'object'
        && restriction !== null
      ) {
        return restriction.id
      }

      return restriction
    })

    filters.useProfile =
      profileResponse.data.enabled

    if (filters.useProfile) {
      filters.selectedRestrictions = [
        ...profileRestrictionIds.value,
      ]
    }
  } catch (err) {
    console.error(
      'Error loading recipe filters:',
      err
    )

    error.value =
      'No se han podido cargar los filtros.'
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

    const additionalRestrictions =
      filters.useProfile
        ? filters.selectedRestrictions.filter(
          restrictionId =>
            !profileRestrictionIds.value.includes(
              restrictionId
            )
        )
        : filters.selectedRestrictions

    if (additionalRestrictions.length) {
      params.restrictions =
        additionalRestrictions.join(',')
    }

    const response = await api.get(
      '/search/recipes/',
      {
        params,
      }
    )

    recipes.value = response.data
  } catch (err) {
    console.error(
      'Error searching recipes:',
      err
    )

    recipes.value = []

    error.value =
      'No se han podido cargar las recetas.'
  } finally {
    loading.value = false
  }
}

function updateUseProfile(value) {
  filters.useProfile = value

  if (value) {
    filters.selectedRestrictions = [
      ...new Set([
        ...filters.selectedRestrictions,
        ...profileRestrictionIds.value,
      ]),
    ]
  }
}

function toggleRestriction(restrictionId) {
  filters.useProfile = false

  if (
    filters.selectedRestrictions.includes(
      restrictionId
    )
  ) {
    filters.selectedRestrictions =
      filters.selectedRestrictions.filter(
        id => id !== restrictionId
      )

    return
  }

  filters.selectedRestrictions = [
    ...filters.selectedRestrictions,
    restrictionId,
  ]
}

function replaceRestrictions({
  type,
  selection,
}) {
  filters.useProfile = false

  const otherTypeIds = restrictions.value
    .filter(
      restriction =>
        restriction.type !== type
        && filters.selectedRestrictions.includes(
          restriction.id
        )
    )
    .map(
      restriction => restriction.id
    )

  filters.selectedRestrictions = [
    ...otherTypeIds,
    ...selection,
  ]
}

function clearFilters() {
  filters.search = ''
  filters.useProfile = false
  filters.selectedRestrictions = []
  filters.ordering = '-publication_date'
}

function selectRecipe(recipe) {
  console.log(
    'Recipe detail pending:',
    recipe.id
  )
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

    searchTimeout = setTimeout(
      () => {
        searchRecipes()
      },
      250
    )
  }
)

onMounted(async () => {
  await loadInitialData()
  await searchRecipes()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="recipes-page">
    <NavBar />

    <main class="recipes-layout">
      <RecipeFilters
        :search="filters.search"
        :use-profile="filters.useProfile"
        :restrictions="restrictions"
        :selected-restrictions="
          filters.selectedRestrictions
        "
        @update:search="
          filters.search = $event
        "
        @update:use-profile="
          updateUseProfile
        "
        @toggle-restriction="
          toggleRestriction
        "
        @replace-restrictions="
          replaceRestrictions
        "
        @clear="clearFilters"
      />

      <section class="recipes-main">
        <h1>
          Recetas adaptadas
        </h1>

        <p class="recipes-subtitle">
          Encuentra recetas compatibles con tus restricciones alimentarias.
        </p>

        <div class="recipes-results">
          <div class="recipes-results-header">
            <strong>
              {{ recipes.length }}
              {{
                recipes.length === 1
                  ? 'receta encontrada'
                  : 'recetas encontradas'
              }}
            </strong>

            <select
              v-model="filters.ordering"
              class="recipes-ordering"
            >
              <option value="-publication_date">
                Más reciente
              </option>

              <option value="-rating">
                Mejor valoradas
              </option>

              <option value="preparation_time">
                Menor tiempo
              </option>

              <option value="-preparation_time">
                Mayor tiempo
              </option>
            </select>
          </div>

          <p
            v-if="loading"
            class="recipes-state"
          >
            Cargando recetas...
          </p>

          <p
            v-else-if="error"
            class="recipes-state recipes-state--error"
          >
            {{ error }}
          </p>

          <p
            v-else-if="!recipes.length"
            class="recipes-state"
          >
            No se han encontrado recetas
            con estos filtros.
          </p>

          <div
            v-else
            class="recipes-grid"
          >
            <RecipeCard
              v-for="recipe in recipes"
              :key="recipe.id"
              :recipe="recipe"
              @select="selectRecipe"
            />
          </div>
        </div>

        <p class="recipes-slogan">
          Everyone can tag along
        </p>
      </section>
    </main>
  </div>
</template>
