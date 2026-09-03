<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import NavBar from '../components/common/NavBar.vue'

import api from '../services/api'

import './EstablishmentFormView.css'


const route = useRoute()
const router = useRouter()


const isEditing = computed(
  () => Boolean(route.params.id)
)

const establishmentId = computed(
  () => route.params.id
)


const tags = ref([])
const restrictions = ref([])
const dishes = ref([])
const deletedDishIds = ref([])

const loading = ref(false)
const saving = ref(false)
const error = ref('')


const dietNames = new Set([
  'vegetariano',
  'vegano',
  'pescetariano',
  'halal',
  'kosher',
])


const form = reactive({
  name: '',
  description: '',
  phone: '',
  email: '',
  opening_time: '',
  closing_time: '',
  cross_contamination: '',
  restrictions_info: '',
  active: true,
  tags: [],
  image_url: '',

  location: {
    address: '',
    city: '',
    region: '',
    country: '',
    postal_code: '',
    latitude: '',
    longitude: '',
  },
})


const pageTitle = computed(() => {
  return isEditing.value
    ? 'Editar establecimiento'
    : 'Crear establecimiento'
})


const submitText = computed(() => {
  if (saving.value) {
    return 'Guardando...'
  }

  return isEditing.value
    ? 'Guardar cambios'
    : 'Crear establecimiento'
})


const allergyRestrictions = computed(() => {
  return restrictions.value.filter(
    restriction =>
      !isDietRestriction(restriction)
  )
})


const dietRestrictions = computed(() => {
  return restrictions.value.filter(
    restriction =>
      isDietRestriction(restriction)
  )
})


async function loadPageData() {
  loading.value = true
  error.value = ''

  try {
    const [
      tagsResponse,
      restrictionsResponse,
    ] = await Promise.all([
      api.get('/establishments/tags/'),
      api.get(
        '/food-profiles/restrictions/'
      ),
    ])

    tags.value = tagsResponse.data
    restrictions.value =
      restrictionsResponse.data

    if (isEditing.value) {
      const response = await api.get(
        `/establishments/${establishmentId.value}/`
      )

      setFormData(response.data)
    }
  } catch (err) {
    console.error(
      'Error loading establishment form:',
      err
    )

    error.value =
      'No se han podido cargar los datos del establecimiento.'
  } finally {
    loading.value = false
  }
}


function setFormData(establishment) {
  form.name =
    establishment.name ?? ''

  form.description =
    establishment.description ?? ''

  form.phone =
    establishment.phone ?? ''

  form.email =
    establishment.email ?? ''

  form.opening_time =
    normalizeTime(
      establishment.opening_time
    )

  form.closing_time =
    normalizeTime(
      establishment.closing_time
    )

  form.cross_contamination =
    establishment.cross_contamination ?? ''

  form.restrictions_info =
    establishment.restrictions_info ?? ''

  form.active =
    establishment.active ?? true

  form.tags = (
    establishment.tags ?? []
  ).map(tag => {
    if (
      typeof tag === 'object'
      && tag !== null
    ) {
      return tag.id
    }

    return tag
  })

  form.image_url =
    establishment.image_url ?? ''

  const location =
    establishment.location ?? {}

  form.location.address =
    location.address ?? ''

  form.location.city =
    location.city ?? ''

  form.location.region =
    location.region ?? ''

  form.location.country =
    location.country ?? ''

  form.location.postal_code =
    location.postal_code ?? ''

  form.location.latitude =
    location.latitude ?? ''

  form.location.longitude =
    location.longitude ?? ''

  dishes.value = (
    establishment.dishes ?? []
  ).map(dish => ({
    id: dish.id,

    name:
      dish.name ?? '',

    description:
      dish.description ?? '',

    price:
      dish.price ?? '',

    available:
      dish.available ?? true,

    image_url:
      dish.image_url ?? '',

    dish_restrictions: (
      dish.dish_restrictions ?? []
    ).map(relation => ({
      restriction:
        Number(relation.restriction),

      presence_type:
        relation.presence_type,
    })),
  }))
}


function normalizeTime(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 5)
}


function normalizeRestrictionName(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
}


function isDietRestriction(restriction) {
  const type = String(
    restriction.type
    ?? restriction.restriction_type
    ?? ''
  ).toLowerCase()

  if (type.includes('diet')) {
    return true
  }

  if (
    type.includes('allerg')
    || type.includes('intoler')
  ) {
    return false
  }

  return dietNames.has(
    normalizeRestrictionName(
      restriction.name
    )
  )
}


function addDish() {
  dishes.value.push({
    id: null,
    name: '',
    description: '',
    price: '',
    available: true,
    image_url: '',
    dish_restrictions: [],
  })
}


function removeDish(index) {
  const dish = dishes.value[index]

  if (dish?.id) {
    deletedDishIds.value.push(
      dish.id
    )
  }

  dishes.value.splice(
    index,
    1
  )
}


function findDishRestriction(
  dish,
  restrictionId
) {
  return dish.dish_restrictions.find(
    relation =>
      Number(relation.restriction)
      === Number(restrictionId)
  )
}


function getAllergyRestrictionValue(
  dish,
  restrictionId
) {
  const relation =
    findDishRestriction(
      dish,
      restrictionId
    )

  return (
    relation?.presence_type
    ?? 'none'
  )
}


function setAllergyRestriction(
  dish,
  restriction,
  value
) {
  setDishRestriction(
    dish,
    restriction,
    value === 'none'
      ? null
      : value
  )
}


function getDietRestrictionValue(
  dish,
  restrictionId
) {
  return findDishRestriction(
    dish,
    restrictionId
  )
    ? 'not_suitable'
    : 'suitable'
}


function setDietRestriction(
  dish,
  restriction,
  value
) {
  /*
   * Para las dietas no necesitamos
   * un tipo adicional en backend.
   *
   * La existencia de DishRestriction
   * ya hace que el plato no sea
   * compatible con esa restricción.
   *
   * Por eso "No apto para" se guarda
   * internamente como "contains".
   */
  setDishRestriction(
    dish,
    restriction,
    value === 'not_suitable'
      ? 'contains'
      : null
  )
}


function setDishRestriction(
  dish,
  restriction,
  presenceType
) {
  const relationIndex =
    dish.dish_restrictions.findIndex(
      relation =>
        Number(relation.restriction)
        === Number(restriction.id)
    )

  if (!presenceType) {
    if (relationIndex !== -1) {
      dish.dish_restrictions.splice(
        relationIndex,
        1
      )
    }

    return
  }

  const relation = {
    restriction:
      Number(restriction.id),

    presence_type:
      presenceType,
  }

  if (relationIndex === -1) {
    dish.dish_restrictions.push(
      relation
    )
  } else {
    dish.dish_restrictions[
      relationIndex
    ] = relation
  }
}


function radioName(
  dish,
  dishIndex,
  restrictionId
) {
  return [
    'dish',
    dish.id ?? `new-${dishIndex}`,
    'restriction',
    restrictionId,
  ].join('-')
}


function toggleTag(tagId) {
  if (form.tags.includes(tagId)) {
    form.tags =
      form.tags.filter(
        id => id !== tagId
      )

    return
  }

  form.tags = [
    ...form.tags,
    tagId,
  ]
}


function validateForm() {
  if (!form.name.trim()) {
    return (
      'Introduce el nombre '
      + 'del establecimiento.'
    )
  }

  if (!form.description.trim()) {
    return (
      'Introduce una descripción '
      + 'del establecimiento.'
    )
  }

  if (!form.location.address.trim()) {
    return (
      'Introduce la dirección '
      + 'del establecimiento.'
    )
  }

  if (!form.location.city.trim()) {
    return 'Introduce la ciudad.'
  }

  if (!form.location.region.trim()) {
    return (
      'Introduce la provincia '
      + 'o región.'
    )
  }

  if (!form.location.country.trim()) {
    return 'Introduce el país.'
  }

  if (
    !form.location.postal_code.trim()
  ) {
    return (
      'Introduce el código postal.'
    )
  }

  const invalidDish =
    dishes.value.find(
      dish =>
        !dish.name.trim()
    )

  if (invalidDish) {
    return (
      'Todos los platos añadidos '
      + 'deben tener un nombre.'
    )
  }

  return ''
}


function nullableNumber(value) {
  if (
    value === ''
    || value === null
    || value === undefined
  ) {
    return null
  }

  return Number(value)
}


function getEstablishmentPayload() {
  return {
    name:
      form.name.trim(),

    description:
      form.description.trim(),

    phone:
      form.phone.trim(),

    email:
      form.email.trim(),

    opening_time:
      form.opening_time || null,

    closing_time:
      form.closing_time || null,

    cross_contamination:
      form.cross_contamination.trim(),

    restrictions_info:
      form.restrictions_info.trim(),

    active:
      form.active,

    tags: [
      ...form.tags,
    ],

    image_url:
      form.image_url.trim(),

    location: {
      address:
        form.location.address.trim(),

      city:
        form.location.city.trim(),

      region:
        form.location.region.trim(),

      country:
        form.location.country.trim(),

      postal_code:
        form.location.postal_code.trim(),

      latitude:
        nullableNumber(
          form.location.latitude
        ),

      longitude:
        nullableNumber(
          form.location.longitude
        ),
    },
  }
}


function getDishPayload(dish) {
  return {
    name:
      dish.name.trim(),

    description:
      dish.description.trim(),

    price:
      dish.price === ''
        ? null
        : dish.price,

    available:
      dish.available,

    image_url:
      dish.image_url.trim(),

    dish_restrictions:
      dish.dish_restrictions.map(
        relation => ({
          restriction:
            relation.restriction,

          presence_type:
            relation.presence_type,
        })
      ),
  }
}


async function syncDishes(id) {
  for (
    const dishId
    of deletedDishIds.value
  ) {
    await api.delete(
      `/establishments/${id}/dishes/${dishId}/`
    )
  }

  for (const dish of dishes.value) {
    const payload =
      getDishPayload(dish)

    if (dish.id) {
      await api.patch(
        `/establishments/${id}/dishes/${dish.id}/`,
        payload
      )
    } else {
      await api.post(
        `/establishments/${id}/dishes/`,
        payload
      )
    }
  }
}


async function saveEstablishment() {
  error.value = ''

  const validationError =
    validateForm()

  if (validationError) {
    error.value =
      validationError

    return
  }

  saving.value = true

  let savedId =
    establishmentId.value

  try {
    if (isEditing.value) {
      await api.patch(
        `/establishments/${savedId}/`,
        getEstablishmentPayload()
      )
    } else {
      const response = await api.post(
        '/establishments/',
        getEstablishmentPayload()
      )

      savedId =
        response.data.id
    }

    await syncDishes(
      savedId
    )

    router.push(
      `/establishments/${savedId}`
    )
  } catch (err) {
    console.error(
      'Error saving establishment:',
      err
    )

    if (
      !isEditing.value
      && savedId
    ) {
      router.replace(
        `/owner/establishments/${savedId}/edit`
      )

      error.value =
        'El establecimiento se ha creado, '
        + 'pero no se han podido guardar '
        + 'todos los platos. Revisa los '
        + 'datos y vuelve a guardar.'

      return
    }

    error.value =
      getApiError(
        err,
        'No se ha podido guardar el establecimiento.'
      )
  } finally {
    saving.value = false
  }
}


function getApiError(
  err,
  fallback
) {
  const data =
    err.response?.data

  if (
    typeof data?.detail
    === 'string'
  ) {
    return data.detail
  }

  if (
    typeof data === 'string'
  ) {
    return data
  }

  return fallback
}


function cancel() {
  router.push(
    '/owner/establishments'
  )
}


onMounted(() => {
  loadPageData()
})
</script>

<template>
  <div class="establishment-form-page">
    <NavBar />

    <main class="establishment-form-content">
      <header class="establishment-form-header">
        <button
          type="button"
          class="establishment-form-back"
          @click="cancel"
        >
          ‹ Volver
        </button>

        <div>
          <h1>
            {{ pageTitle }}
          </h1>

          <p>
            {{
              isEditing
                ? 'Actualiza la información y los platos del establecimiento.'
                : 'Completa la información del nuevo establecimiento.'
            }}
          </p>
        </div>
      </header>

      <p
        v-if="loading"
        class="establishment-form-state"
      >
        Cargando datos...
      </p>

      <form
        v-else
        class="establishment-form"
        @submit.prevent="saveEstablishment"
      >
        <!-- INFORMACIÓN GENERAL -->

        <section class="establishment-form-section">
          <div class="establishment-section-heading">
            <div>
              <h2>
                Información general
              </h2>

              <p>
                Datos principales del establecimiento.
              </p>
            </div>

            <label class="establishment-active-toggle">
              <input
                v-model="form.active"
                type="checkbox"
              >

              <span>
                Establecimiento activo
              </span>
            </label>
          </div>

          <div class="establishment-form-grid">
            <label class="establishment-field">
              <span>
                Nombre *
              </span>

              <input
                v-model="form.name"
                type="text"
                maxlength="150"
                placeholder="Nombre del establecimiento"
              >
            </label>

            <label class="establishment-field">
              <span>
                URL de imagen
              </span>

              <input
                v-model="form.image_url"
                type="url"
                placeholder="https://..."
              >
            </label>

            <label
              class="
                establishment-field
                establishment-field--full
              "
            >
              <span>
                Descripción *
              </span>

              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Describe el establecimiento..."
              ></textarea>
            </label>

            <label class="establishment-field">
              <span>
                Teléfono
              </span>

              <input
                v-model="form.phone"
                type="text"
                maxlength="30"
                placeholder="Teléfono de contacto"
              >
            </label>

            <label class="establishment-field">
              <span>
                Correo electrónico
              </span>

              <input
                v-model="form.email"
                type="email"
                placeholder="correo@ejemplo.com"
              >
            </label>

            <label class="establishment-field">
              <span>
                Hora de apertura
              </span>

              <input
                v-model="form.opening_time"
                type="time"
              >
            </label>

            <label class="establishment-field">
              <span>
                Hora de cierre
              </span>

              <input
                v-model="form.closing_time"
                type="time"
              >
            </label>

            <label
              class="
                establishment-field
                establishment-field--full
              "
            >
              <span>
                Información sobre restricciones
              </span>

              <textarea
                v-model="form.restrictions_info"
                rows="3"
                placeholder="Información sobre alérgenos, adaptaciones o protocolos..."
              ></textarea>
            </label>

            <label
              class="
                establishment-field
                establishment-field--full
              "
            >
              <span>
                Contaminación cruzada
              </span>

              <textarea
                v-model="form.cross_contamination"
                rows="3"
                placeholder="Información sobre posibles riesgos de contaminación cruzada..."
              ></textarea>
            </label>
          </div>

          <div class="establishment-tags-field">
            <span class="establishment-tags-label">
              Etiquetas
            </span>

            <div
              v-if="tags.length"
              class="establishment-tags-list"
            >
              <button
                v-for="tag in tags"
                :key="tag.id"
                type="button"
                class="establishment-tag"
                :class="{
                  'establishment-tag--selected':
                    form.tags.includes(tag.id),
                }"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>

            <p
              v-else
              class="establishment-tags-empty"
            >
              No hay etiquetas disponibles.
            </p>
          </div>
        </section>


        <!-- UBICACIÓN -->

        <section class="establishment-form-section">
          <div class="establishment-section-heading">
            <div>
              <h2>
                Ubicación
              </h2>

              <p>
                Dirección y coordenadas utilizadas
                para localizar el establecimiento.
              </p>
            </div>
          </div>

          <div class="establishment-form-grid">
            <label
              class="
                establishment-field
                establishment-field--full
              "
            >
              <span>
                Dirección *
              </span>

              <input
                v-model="form.location.address"
                type="text"
                maxlength="255"
                placeholder="Calle, número..."
              >
            </label>

            <label class="establishment-field">
              <span>
                Ciudad *
              </span>

              <input
                v-model="form.location.city"
                type="text"
                maxlength="100"
              >
            </label>

            <label class="establishment-field">
              <span>
                Provincia o región *
              </span>

              <input
                v-model="form.location.region"
                type="text"
                maxlength="100"
              >
            </label>

            <label class="establishment-field">
              <span>
                País *
              </span>

              <input
                v-model="form.location.country"
                type="text"
                maxlength="100"
              >
            </label>

            <label class="establishment-field">
              <span>
                Código postal *
              </span>

              <input
                v-model="form.location.postal_code"
                type="text"
                maxlength="20"
              >
            </label>

            <label class="establishment-field">
              <span>
                Latitud
              </span>

              <input
                v-model="form.location.latitude"
                type="number"
                step="any"
                placeholder="40.4168"
              >
            </label>

            <label class="establishment-field">
              <span>
                Longitud
              </span>

              <input
                v-model="form.location.longitude"
                type="number"
                step="any"
                placeholder="-3.7038"
              >
            </label>
          </div>
        </section>


        <!-- PLATOS -->

        <section class="establishment-form-section">
          <div class="establishment-section-heading">
            <div>
              <h2>
                Platos
              </h2>

              <p>
                Añade los platos y especifica
                sus restricciones alimentarias.
              </p>
            </div>

            <button
              type="button"
              class="dish-add-button"
              @click="addDish"
            >
              <span>
                +
              </span>

              Añadir plato
            </button>
          </div>

          <div
            v-if="dishes.length"
            class="dish-form-list"
          >
            <article
              v-for="(
                dish,
                dishIndex
              ) in dishes"
              :key="
                dish.id
                ?? `new-${dishIndex}`
              "
              class="dish-form-row"
            >
              <!-- DATOS DEL PLATO -->

              <div class="dish-form-primary">
                <label class="establishment-field">
                  <span>
                    Nombre *
                  </span>

                  <input
                    v-model="dish.name"
                    type="text"
                    maxlength="150"
                    placeholder="Nombre del plato"
                  >
                </label>

                <label
                  class="
                    establishment-field
                    dish-price-field
                  "
                >
                  <span>
                    Precio
                  </span>

                  <input
                    v-model="dish.price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                  >
                </label>

                <label class="dish-available-field">
                  <input
                    v-model="dish.available"
                    type="checkbox"
                  >

                  <span>
                    Disponible
                  </span>
                </label>

                <button
                  type="button"
                  class="dish-delete-button"
                  title="Eliminar plato"
                  aria-label="Eliminar plato"
                  @click="removeDish(dishIndex)"
                >
                  ×
                </button>
              </div>

              <div class="dish-form-secondary">
                <label class="establishment-field">
                  <span>
                    Descripción
                  </span>

                  <textarea
                    v-model="dish.description"
                    rows="2"
                    placeholder="Descripción del plato..."
                  ></textarea>
                </label>

                <label class="establishment-field">
                  <span>
                    URL de imagen
                  </span>

                  <input
                    v-model="dish.image_url"
                    type="url"
                    placeholder="https://..."
                  >
                </label>
              </div>


              <!-- RESTRICCIONES -->

              <div class="dish-restrictions">
                <div class="dish-restrictions-heading">
                  <strong>
                    Restricciones alimentarias
                  </strong>

                  <span>
                    Indica la presencia de alérgenos
                    y si el plato es apto para cada dieta.
                  </span>
                </div>


                <!-- ALERGIAS -->

                <div
                  v-if="allergyRestrictions.length"
                  class="restriction-table-block"
                >
                  <h4>
                    Alergias e intolerancias
                  </h4>

                  <div class="restriction-table-scroll">
                    <div
                      class="
                        restriction-grid
                        restriction-grid--allergies
                      "
                    >
                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                          restriction-grid-name
                        "
                      >
                        Restricción
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        No
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        Contiene
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        Puede contener
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        Trazas
                      </div>

                      <template
                        v-for="restriction in allergyRestrictions"
                        :key="restriction.id"
                      >
                        <div
                          class="
                            restriction-grid-cell
                            restriction-grid-name
                          "
                        >
                          {{ restriction.name }}
                        </div>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="none"
                            :checked="
                              getAllergyRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'none'
                            "
                            @change="
                              setAllergyRestriction(
                                dish,
                                restriction,
                                'none'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            No
                          </span>
                        </label>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="contains"
                            :checked="
                              getAllergyRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'contains'
                            "
                            @change="
                              setAllergyRestriction(
                                dish,
                                restriction,
                                'contains'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            Contiene
                          </span>
                        </label>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="may_contain"
                            :checked="
                              getAllergyRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'may_contain'
                            "
                            @change="
                              setAllergyRestriction(
                                dish,
                                restriction,
                                'may_contain'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            Puede contener
                          </span>
                        </label>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="traces"
                            :checked="
                              getAllergyRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'traces'
                            "
                            @change="
                              setAllergyRestriction(
                                dish,
                                restriction,
                                'traces'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            Trazas
                          </span>
                        </label>
                      </template>
                    </div>
                  </div>
                </div>


                <!-- DIETAS -->

                <div
                  v-if="dietRestrictions.length"
                  class="restriction-table-block"
                >
                  <h4>
                    Dietas
                  </h4>

                  <div class="restriction-table-scroll">
                    <div
                      class="
                        restriction-grid
                        restriction-grid--diets
                      "
                    >
                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                          restriction-grid-name
                        "
                      >
                        Dieta
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        Apto
                      </div>

                      <div
                        class="
                          restriction-grid-cell
                          restriction-grid-heading
                        "
                      >
                        No apto para
                      </div>

                      <template
                        v-for="restriction in dietRestrictions"
                        :key="restriction.id"
                      >
                        <div
                          class="
                            restriction-grid-cell
                            restriction-grid-name
                          "
                        >
                          {{ restriction.name }}
                        </div>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="suitable"
                            :checked="
                              getDietRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'suitable'
                            "
                            @change="
                              setDietRestriction(
                                dish,
                                restriction,
                                'suitable'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            Apto
                          </span>
                        </label>

                        <label
                          class="
                            restriction-grid-cell
                            restriction-radio-cell
                          "
                        >
                          <input
                            type="radio"
                            :name="
                              radioName(
                                dish,
                                dishIndex,
                                restriction.id
                              )
                            "
                            value="not_suitable"
                            :checked="
                              getDietRestrictionValue(
                                dish,
                                restriction.id
                              ) === 'not_suitable'
                            "
                            @change="
                              setDietRestriction(
                                dish,
                                restriction,
                                'not_suitable'
                              )
                            "
                          >

                          <span class="restriction-radio-label">
                            No apto para
                          </span>
                        </label>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="dish-form-empty"
          >
            <strong>
              No hay platos añadidos
            </strong>

            <p>
              Puedes guardar el establecimiento
              sin platos o añadirlos ahora.
            </p>
          </div>
        </section>

        <p
          v-if="error"
          class="establishment-form-error"
          role="alert"
        >
          {{ error }}
        </p>

        <footer class="establishment-form-actions">
          <button
            type="button"
            class="establishment-cancel-button"
            :disabled="saving"
            @click="cancel"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="establishment-save-button"
            :disabled="saving"
          >
            {{ submitText }}
          </button>
        </footer>
      </form>

      <p class="establishment-form-slogan">
        Everyone can tag along
      </p>
    </main>
  </div>
</template>
