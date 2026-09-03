<script setup>
import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue'

import './RecipeFormPanel.css'

import RecipeRestrictionModal from './RecipeRestrictionModal.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  mode: {
    type: String,
    default: 'create',
    validator: value =>
      ['create', 'edit'].includes(value),
  },

  recipe: {
    type: Object,
    default: null,
  },

  restrictions: {
    type: Array,
    default: () => [],
  },

  saving: {
    type: Boolean,
    default: false,
  },

  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'close',
  'submit',
])

const form = reactive({
  title: '',
  description: '',
  preparationTime: '',
  imageUrl: '',
  ingredients: '',
  steps: '',
})

const adaptedRestrictionIds = ref([])
const blockedRestrictionIds = ref([])

const restrictionModalOpen = ref(false)
const restrictionModalType = ref('adapted_for')

const panelTitle = computed(() =>
  props.mode === 'edit'
    ? 'Editar receta'
    : 'Crear receta'
)

const submitText = computed(() => {
  if (props.saving) {
    return 'Guardando...'
  }

  return props.mode === 'edit'
    ? 'Guardar cambios'
    : 'Crear receta'
})

const modalTitle = computed(() =>
  restrictionModalType.value === 'adapted_for'
    ? 'Receta adaptada para'
    : 'Restricciones bloqueantes'
)

const currentModalSelection = computed(() =>
  restrictionModalType.value === 'adapted_for'
    ? adaptedRestrictionIds.value
    : blockedRestrictionIds.value
)

const adaptedRestrictions = computed(() =>
  getRestrictions(
    adaptedRestrictionIds.value
  )
)

const blockedRestrictions = computed(() =>
  getRestrictions(
    blockedRestrictionIds.value
  )
)

watch(
  () => [
    props.open,
    props.mode,
    props.recipe,
  ],
  ([open]) => {
    if (open) {
      resetForm()
    }
  },
  {
    deep: true,
  }
)

function resetForm() {
  form.title =
    props.recipe?.title ?? ''

  form.description =
    props.recipe?.description ?? ''

  form.preparationTime =
    props.recipe?.preparation_time ?? ''

  form.imageUrl =
    props.recipe?.image_url ?? ''

  form.ingredients =
    normalizeMultiline(
      props.recipe?.ingredients ?? ''
    )

  form.steps =
    normalizeMultiline(
      props.recipe?.steps ?? ''
    )

  const relations =
    props.recipe?.recipe_restrictions
    ?? []

  adaptedRestrictionIds.value =
    relations
      .filter(
        relation =>
          relation.relation_type
          === 'adapted_for'
      )
      .map(
        relation => relation.restriction
      )

  blockedRestrictionIds.value =
    relations
      .filter(
        relation =>
          relation.relation_type
          === 'blocks'
      )
      .map(
        relation => relation.restriction
      )
}

function normalizeMultiline(value) {
  return String(value)
    .replace(/\\r\\n|\\n|\\r/g, '\n')
}

function getRestrictions(ids) {
  return ids
    .map(id =>
      props.restrictions.find(
        restriction =>
          restriction.id === id
      )
    )
    .filter(Boolean)
}

function restrictionText(restriction) {
  if (
    restriction.type === 'allergy'
  ) {
    return `Sin ${restriction.name.toLowerCase()}`
  }

  return restriction.name
}

function openRestrictionModal(type) {
  restrictionModalType.value = type
  restrictionModalOpen.value = true
}

function closeRestrictionModal() {
  restrictionModalOpen.value = false
}

function confirmRestrictions(selection) {
  if (
    restrictionModalType.value
    === 'adapted_for'
  ) {
    adaptedRestrictionIds.value = selection

    blockedRestrictionIds.value =
      blockedRestrictionIds.value.filter(
        id => !selection.includes(id)
      )
  } else {
    blockedRestrictionIds.value = selection

    adaptedRestrictionIds.value =
      adaptedRestrictionIds.value.filter(
        id => !selection.includes(id)
      )
  }

  closeRestrictionModal()
}

function removeAdaptedRestriction(id) {
  adaptedRestrictionIds.value =
    adaptedRestrictionIds.value.filter(
      restrictionId =>
        restrictionId !== id
    )
}

function removeBlockedRestriction(id) {
  blockedRestrictionIds.value =
    blockedRestrictionIds.value.filter(
      restrictionId =>
        restrictionId !== id
    )
}

function submitForm() {
  emit('submit', {
    title: form.title.trim(),
    description:
      form.description.trim(),
    preparation_time:
      form.preparationTime === ''
        ? null
        : Number(form.preparationTime),
    image_url:
      form.imageUrl.trim(),
    ingredients:
      form.ingredients.trim(),
    steps:
      form.steps.trim(),
    recipe_restrictions: [
      ...adaptedRestrictionIds.value.map(
        restriction => ({
          restriction,
          relation_type: 'adapted_for',
        })
      ),
      ...blockedRestrictionIds.value.map(
        restriction => ({
          restriction,
          relation_type: 'blocks',
        })
      ),
    ],
  })
}
</script>

<template>
  <Transition name="recipe-form">
    <div
      v-if="open"
      class="recipe-form-overlay"
      @click="emit('close')"
    >
      <aside
        class="recipe-form-panel"
        @click.stop
      >
        <form
          class="recipe-form-scroll"
          @submit.prevent="submitForm"
        >
          <button
            type="button"
            class="recipe-form-back"
            @click="emit('close')"
          >
            <span>
              ‹
            </span>

            Volver
          </button>

          <div class="recipe-form-header">
            <h2>
              {{ panelTitle }}
            </h2>

            <p>
              {{
                mode === 'edit'
                  ? 'Modifica la información de tu receta.'
                  : 'Comparte una nueva receta adaptada con la comunidad.'
              }}
            </p>
          </div>

          <div class="recipe-form-fields">
            <label class="recipe-form-field">
              <span>
                Título *
              </span>

              <input
                v-model="form.title"
                type="text"
                maxlength="150"
                required
                placeholder="Nombre de la receta"
              >
            </label>

            <label class="recipe-form-field">
              <span>
                URL de la imagen
              </span>

              <input
                v-model="form.imageUrl"
                type="url"
                placeholder="https://..."
              >
            </label>

            <label class="recipe-form-field">
              <span>
                Descripción
              </span>

              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe brevemente la receta..."
              />
            </label>

            <label class="recipe-form-field">
              <span>
                Tiempo de preparación
              </span>

              <div class="recipe-time-input">
                <input
                  v-model="form.preparationTime"
                  type="number"
                  min="1"
                  placeholder="30"
                >

                <span>
                  minutos
                </span>
              </div>
            </label>

            <label class="recipe-form-field">
              <span>
                Ingredientes *
              </span>

              <textarea
                v-model="form.ingredients"
                rows="7"
                required
                placeholder="Un ingrediente por línea..."
              />

              <small>
                Escribe cada ingrediente
                en una línea diferente.
              </small>
            </label>

            <label class="recipe-form-field">
              <span>
                Pasos de elaboración *
              </span>

              <textarea
                v-model="form.steps"
                rows="7"
                required
                placeholder="Un paso por línea..."
              />

              <small>
                Escribe cada paso
                en una línea diferente.
              </small>
            </label>

            <section class="recipe-form-restrictions">
              <div class="recipe-form-section-heading">
                <div>
                  <h3>
                    Adaptada para
                  </h3>

                  <p>
                    Restricciones para las que
                    la receta está específicamente adaptada.
                  </p>
                </div>

                <button
                  type="button"
                  @click="
                    openRestrictionModal(
                      'adapted_for'
                    )
                  "
                >
                  + Seleccionar
                </button>
              </div>

              <div
                v-if="adaptedRestrictions.length"
                class="recipe-form-badges"
              >
                <span
                  v-for="
                    restriction
                    in adaptedRestrictions
                  "
                  :key="restriction.id"
                  class="
                    recipe-form-badge
                    recipe-form-badge--adapted
                  "
                >
                  ✓
                  {{ restrictionText(
                    restriction
                  ) }}

                  <button
                    type="button"
                    @click="
                      removeAdaptedRestriction(
                        restriction.id
                      )
                    "
                  >
                    ×
                  </button>
                </span>
              </div>

              <p
                v-else
                class="recipe-form-empty"
              >
                No se han seleccionado restricciones.
              </p>
            </section>

            <section class="recipe-form-restrictions">
              <div class="recipe-form-section-heading">
                <div>
                  <h3>
                    Restricciones bloqueantes
                  </h3>

                  <p>
                    Selecciona las restricciones
                    que impiden consumir esta receta.
                  </p>
                </div>

                <button
                  type="button"
                  @click="
                    openRestrictionModal(
                      'blocks'
                    )
                  "
                >
                  + Seleccionar
                </button>
              </div>

              <div
                v-if="blockedRestrictions.length"
                class="recipe-form-badges"
              >
                <span
                  v-for="
                    restriction
                    in blockedRestrictions
                  "
                  :key="restriction.id"
                  class="
                    recipe-form-badge
                    recipe-form-badge--blocked
                  "
                >
                  {{ restriction.name }}

                  <button
                    type="button"
                    @click="
                      removeBlockedRestriction(
                        restriction.id
                      )
                    "
                  >
                    ×
                  </button>
                </span>
              </div>

              <p
                v-else
                class="recipe-form-empty"
              >
                No se han seleccionado restricciones.
              </p>
            </section>

            <p
              v-if="error"
              class="recipe-form-error"
            >
              {{ error }}
            </p>

            <button
              type="submit"
              class="recipe-form-submit"
              :disabled="saving"
            >
              {{ submitText }}
            </button>
          </div>

          <RecipeRestrictionModal
            :open="restrictionModalOpen"
            :title="modalTitle"
            :restrictions="restrictions"
            :selected-restrictions="
              currentModalSelection
            "
            @close="closeRestrictionModal"
            @confirm="confirmRestrictions"
          />
        </form>
      </aside>
    </div>
  </Transition>
</template>
