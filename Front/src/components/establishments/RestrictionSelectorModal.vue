<script setup>
import { computed, ref, watch } from 'vue'

import './RestrictionSelectorModal.css'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
    required: true,
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

const emit = defineEmits(['close', 'confirm'])

const temporarySelection = ref([])

const availableRestrictions = computed(() =>
  props.restrictions.filter((restriction) => restriction.type === props.type)
)

watch(
  () => props.open,
  (open) => {
    if (open) {
      temporarySelection.value = [...props.selectedRestrictions]
    }
  }
)

function toggleRestriction(restrictionId) {
  if (temporarySelection.value.includes(restrictionId)) {
    temporarySelection.value = temporarySelection.value.filter((id) => id !== restrictionId)
  } else {
    temporarySelection.value.push(restrictionId)
  }
}

function confirmSelection() {
  emit('confirm', temporarySelection.value)
}

function closeModal() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="restriction-modal-backdrop" @click.self="closeModal">
    <div class="restriction-modal">
      <div class="restriction-modal-header">
        <h3>
          {{ type === 'allergy' ? 'Añadir alergias e intolerancias' : 'Añadir preferencias' }}
        </h3>

        <button type="button" class="restriction-modal-close" @click="closeModal">×</button>
      </div>

      <div class="restriction-modal-list">
        <label
          v-for="restriction in availableRestrictions"
          :key="restriction.id"
          class="restriction-modal-option"
        >
          <input
            type="checkbox"
            :checked="temporarySelection.includes(restriction.id)"
            @change="toggleRestriction(restriction.id)"
          />

          <span>
            {{ restriction.name }}
          </span>
        </label>
      </div>

      <div class="restriction-modal-actions">
        <button type="button" class="restriction-modal-cancel" @click="closeModal">Cancelar</button>

        <button type="button" class="restriction-modal-confirm" @click="confirmSelection">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>
