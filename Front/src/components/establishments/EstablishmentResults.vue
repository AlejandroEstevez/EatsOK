<script setup>
import './EstablishmentResults.css'

import EstablishmentCard from './EstablishmentCard.vue'

defineProps({
  establishments: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },

  ordering: {
    type: String,
    default: 'distance',
  },
})

defineEmits([
  'update:ordering',
  'select-establishment',
  'hover-establishment',
  'leave-establishment',
])
</script>

<template>
  <aside class="establishment-results">
    <div class="results-header">
      <div>
        <h2>Resultados ({{ establishments.length }})</h2>
      </div>

      <select
        :value="ordering"
        class="results-ordering"
        @change="$emit('update:ordering', $event.target.value)"
      >
        <option value="distance">Proximidad</option>

        <option value="-rating">Mejor valorados</option>

        <option value="-compatible_dishes">Más platos compatibles</option>

        <option value="-compatible_percentage">Mayor compatibilidad</option>
      </select>
    </div>

    <div class="results-divider"></div>

    <div v-if="loading" class="results-state">Cargando establecimientos...</div>

    <div v-else-if="establishments.length === 0" class="results-state">
      No se han encontrado establecimientos.
    </div>

    <div v-else class="results-list">
      <EstablishmentCard
        v-for="establishment in establishments"
        :key="establishment.id"
        :establishment="establishment"
        @select="$emit('select-establishment', $event)"
        @hover="$emit('hover-establishment', $event)"
        @leave="$emit('leave-establishment')"
      />
    </div>
  </aside>
</template>
