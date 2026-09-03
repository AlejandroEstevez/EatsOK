<script setup>
import { computed, ref } from 'vue'

import './RecipeFilters.css'

import RestrictionCard from '../food-profile/RestrictionCard.vue'
import RestrictionSelectorModal from '../establishments/RestrictionSelectorModal.vue'

const props = defineProps({
  search: {
    type: String,
    default: '',
  },

  useProfile: {
    type: Boolean,
    default: true,
  },

  restrictions: {
    type: Array,
    default: () => [],
  },

  selectedRestrictions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:search',
  'update:use-profile',
  'toggle-restriction',
  'replace-restrictions',
  'clear',
])

const selectorOpen = ref(false)
const selectorType = ref('allergy')

const selectedAllergies = computed(() =>
  props.restrictions.filter(
    restriction =>
      restriction.type === 'allergy'
      && props.selectedRestrictions.includes(restriction.id)
  )
)

const selectedDiets = computed(() =>
  props.restrictions.filter(
    restriction =>
      restriction.type === 'diet'
      && props.selectedRestrictions.includes(restriction.id)
  )
)

function openSelector(type) {
  selectorType.value = type
  selectorOpen.value = true
}

function closeSelector() {
  selectorOpen.value = false
}

function confirmSelector(selection) {
  emit('replace-restrictions', {
    type: selectorType.value,
    selection,
  })

  selectorOpen.value = false
}
</script>

<template>
  <aside class="recipe-filters">
    <section class="recipe-filters-section">
      <h2>
        Buscar
      </h2>

      <div class="recipe-search">
        <span class="recipe-search-icon">
          ⌕
        </span>

        <input
          :value="search"
          type="text"
          placeholder="Buscar recetas..."
          @input="emit(
            'update:search',
            $event.target.value
          )"
        >
      </div>
    </section>

    <div class="recipe-filters-divider" />

    <section
      class="
        recipe-filters-section
        recipe-food-filters-section
      "
    >
      <h2>
        Filtros
      </h2>

      <div class="recipe-profile-filter-row">
        <span>
          Usar mi perfil alimentario
        </span>

        <button
          type="button"
          class="recipe-profile-toggle"
          :class="{
            'recipe-profile-toggle--active':
              useProfile,
          }"
          :aria-pressed="useProfile"
          @click="emit(
            'update:use-profile',
            !useProfile
          )"
        >
          <span />
        </button>
      </div>

      <div class="recipe-restriction-group">
        <span class="recipe-restriction-group-title">
          Alergias e intolerancias
        </span>

        <div class="recipe-filter-restrictions">
          <RestrictionCard
            v-for="restriction in selectedAllergies"
            :key="restriction.id"
            :restriction="restriction"
            selected
            @toggle="emit(
              'toggle-restriction',
              $event
            )"
          />
        </div>

        <button
          type="button"
          class="recipe-add-filter-button"
          @click="openSelector('allergy')"
        >
          +Añadir más
        </button>
      </div>

      <div class="recipe-restriction-group">
        <span class="recipe-restriction-group-title">
          Dietas
        </span>

        <div class="recipe-filter-restrictions">
          <RestrictionCard
            v-for="restriction in selectedDiets"
            :key="restriction.id"
            :restriction="restriction"
            selected
            @toggle="emit(
              'toggle-restriction',
              $event
            )"
          />
        </div>

        <button
          type="button"
          class="recipe-add-filter-button"
          @click="openSelector('diet')"
        >
          +Añadir más
        </button>
      </div>
    </section>

    <button
      type="button"
      class="recipe-clear-filters-button"
      @click="emit('clear')"
    >
      <span class="recipe-clear-filters-icon">
        ↻
      </span>

      Limpiar filtros
    </button>

    <RestrictionSelectorModal
      :open="selectorOpen"
      :type="selectorType"
      :restrictions="restrictions"
      :selected-restrictions="selectedRestrictions"
      @close="closeSelector"
      @confirm="confirmSelector"
    />
  </aside>
</template>
