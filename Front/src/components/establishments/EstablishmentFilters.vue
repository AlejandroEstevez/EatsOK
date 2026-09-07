<script setup>
import { computed, ref } from 'vue'

import './EstablishmentFilters.css'

import RestrictionCard from '../food-profile/RestrictionCard.vue'
import RestrictionSelectorModal from './RestrictionSelectorModal.vue'

const props = defineProps({
  search: {
    type: String,
    default: '',
  },

  locationMode: {
    type: String,
    default: 'current',
  },

  radius: {
    type: Number,
    default: 5,
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
  'update:location-mode',
  'update:radius',
  'update:use-profile',
  'toggle-restriction',
  'replace-restrictions',
  'clear',
])

const selectorOpen = ref(false)
const selectorType = ref('allergy')

const selectedAllergies = computed(() =>
  props.restrictions.filter(
    (restriction) =>
      restriction.type === 'allergy' && props.selectedRestrictions.includes(restriction.id)
  )
)

const selectedDiets = computed(() =>
  props.restrictions.filter(
    (restriction) =>
      restriction.type === 'diet' && props.selectedRestrictions.includes(restriction.id)
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
  <aside class="establishment-filters">
    <section class="filters-section search-section">
      <h2>Buscar</h2>

      <div class="establishment-search">
        <span class="establishment-search-icon"> ⌕ </span>

        <input
          :value="search"
          type="text"
          placeholder="Buscar restaurantes, platos..."
          @input="emit('update:search', $event.target.value)"
        />
      </div>
    </section>

    <section class="filters-section location-section">
      <h3>Ubicación</h3>

      <label class="location-option">
        <input
          type="radio"
          name="location"
          value="current"
          :checked="locationMode === 'current'"
          @change="emit('update:location-mode', 'current')"
        />

        <span>Mi ubicación actual</span>
      </label>

      <label class="location-option">
        <input
          type="radio"
          name="location"
          value="map"
          :checked="locationMode === 'map'"
          @change="emit('update:location-mode', 'map')"
        />

        <span>Seleccionar en el mapa</span>
      </label>

      <div class="radius-header">
        <span>Radio de búsqueda</span>

        <strong> {{ radius }}km </strong>
      </div>

      <input
        class="radius-slider"
        type="range"
        min="1"
        max="10"
        step="1"
        :value="radius"
        @input="emit('update:radius', Number($event.target.value))"
      />
    </section>

    <div class="filters-divider"></div>

    <section class="filters-section food-filters-section">
      <h2>Filtros</h2>

      <div class="profile-filter-row">
        <span>Usar mi perfil alimentario</span>

        <button
          type="button"
          class="profile-toggle"
          :class="{ 'profile-toggle--active': useProfile }"
          :aria-pressed="useProfile"
          @click="emit('update:use-profile', !useProfile)"
        >
          <span></span>
        </button>
      </div>

      <div class="restriction-group">
        <span class="restriction-group-title"> Alergias e intolerancias </span>

        <div class="filter-restrictions">
          <RestrictionCard
            v-for="restriction in selectedAllergies"
            :key="restriction.id"
            :restriction="restriction"
            selected
            @toggle="emit('toggle-restriction', $event)"
          />
        </div>

        <button type="button" class="add-filter-button" @click="openSelector('allergy')">
          +Añadir más
        </button>
      </div>

      <div class="restriction-group">
        <span class="restriction-group-title"> Preferencias </span>

        <div class="filter-restrictions">
          <RestrictionCard
            v-for="restriction in selectedDiets"
            :key="restriction.id"
            :restriction="restriction"
            selected
            @toggle="emit('toggle-restriction', $event)"
          />
        </div>

        <button type="button" class="add-filter-button" @click="openSelector('diet')">
          +Añadir más
        </button>
      </div>
    </section>

    <button type="button" class="clear-filters-button" @click="emit('clear')">
      <span class="clear-filters-icon"> ↻ </span>

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
