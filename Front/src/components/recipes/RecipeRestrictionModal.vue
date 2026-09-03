<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import './RecipeRestrictionModal.css'

import RestrictionCard from '../food-profile/RestrictionCard.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: 'Seleccionar restricciones',
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
  'close',
  'confirm',
])

const selection = ref([])

const allergies = computed(() =>
  props.restrictions.filter(
    restriction =>
      restriction.type === 'allergy'
  )
)

const diets = computed(() =>
  props.restrictions.filter(
    restriction =>
      restriction.type === 'diet'
  )
)

watch(
  () => props.open,
  open => {
    if (open) {
      selection.value = [
        ...props.selectedRestrictions,
      ]
    }
  }
)

function toggleRestriction(restrictionId) {
  if (
    selection.value.includes(
      restrictionId
    )
  ) {
    selection.value =
      selection.value.filter(
        id => id !== restrictionId
      )

    return
  }

  selection.value = [
    ...selection.value,
    restrictionId,
  ]
}

function confirm() {
  emit(
    'confirm',
    [...selection.value]
  )
}
</script>

<template>
  <Transition name="recipe-restriction-modal">
    <div
      v-if="open"
      class="recipe-restriction-modal-overlay"
      @click="emit('close')"
    >
      <div
        class="recipe-restriction-modal"
        @click.stop
      >
        <div class="recipe-restriction-modal-header">
          <div>
            <h3>
              {{ title }}
            </h3>

            <p>
              Selecciona las restricciones
              que correspondan.
            </p>
          </div>

          <button
            type="button"
            class="recipe-restriction-modal-close"
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <div class="recipe-restriction-modal-content">
          <section>
            <h4>
              Alergias e intolerancias
            </h4>

            <div class="recipe-restriction-modal-grid">
              <RestrictionCard
                v-for="restriction in allergies"
                :key="restriction.id"
                :restriction="restriction"
                :selected="
                  selection.includes(
                    restriction.id
                  )
                "
                @toggle="toggleRestriction"
              />
            </div>
          </section>

          <section>
            <h4>
              Dietas
            </h4>

            <div class="recipe-restriction-modal-grid">
              <RestrictionCard
                v-for="restriction in diets"
                :key="restriction.id"
                :restriction="restriction"
                :selected="
                  selection.includes(
                    restriction.id
                  )
                "
                @toggle="toggleRestriction"
              />
            </div>
          </section>
        </div>

        <div class="recipe-restriction-modal-actions">
          <button
            type="button"
            class="recipe-restriction-cancel"
            @click="emit('close')"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="recipe-restriction-confirm"
            @click="confirm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
