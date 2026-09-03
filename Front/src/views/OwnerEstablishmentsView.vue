<script setup>
import {
  onMounted,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '../components/common/NavBar.vue'

import api from '../services/api'

import './OwnerEstablishmentsView.css'


const router = useRouter()

const establishments = ref([])
const loading = ref(false)
const error = ref('')


async function loadEstablishments() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get(
      '/establishments/',
      {
        params: {
          mine: true,
        },
      }
    )

    establishments.value =
      response.data
  } catch (err) {
    console.error(
      'Error loading owner establishments:',
      err
    )

    establishments.value = []

    error.value =
      'No se han podido cargar tus establecimientos.'
  } finally {
    loading.value = false
  }
}


function openEstablishment(establishment) {
  router.push(
    `/establishments/${establishment.id}`
  )
}


function openCreateEstablishment() {
  router.push(
    '/owner/establishments/new'
  )
}


function locationText(establishment) {
  const location =
    establishment.location

  if (!location) {
    return 'Ubicación no disponible'
  }

  return [
    location.address,
    location.city,
  ]
    .filter(Boolean)
    .join(', ')
}


onMounted(() => {
  loadEstablishments()
})
</script>

<template>
  <div class="owner-establishments-page">
    <NavBar />

    <main class="owner-establishments-content">
      <section class="owner-establishments-card">
        <header class="owner-establishments-header">
          <div>
            <h1>
              Mis establecimientos
            </h1>

            <p>
              Consulta y gestiona los establecimientos
              asociados a tu cuenta.
            </p>
          </div>

          <button
            type="button"
            class="owner-establishments-create"
            @click="openCreateEstablishment"
          >
            <span>
              +
            </span>

            Crear
          </button>
        </header>

        <p
          v-if="loading"
          class="owner-establishments-state"
        >
          Cargando establecimientos...
        </p>

        <p
          v-else-if="error"
          class="
            owner-establishments-state
            owner-establishments-state--error
          "
        >
          {{ error }}
        </p>

        <div
          v-else-if="establishments.length"
          class="owner-establishments-list"
        >
          <button
            v-for="establishment in establishments"
            :key="establishment.id"
            type="button"
            class="owner-establishment-item"
            @click="
              openEstablishment(establishment)
            "
          >
            <div class="owner-establishment-image">
              <img
                v-if="establishment.image_url"
                :src="establishment.image_url"
                :alt="establishment.name"
              />

              <span v-else>
                📷
              </span>
            </div>

            <div class="owner-establishment-info">
              <div class="owner-establishment-title">
                <h2>
                  {{ establishment.name }}
                </h2>

                <span
                  class="owner-establishment-status"
                  :class="{
                    'owner-establishment-status--inactive':
                      !establishment.active,
                  }"
                >
                  {{
                    establishment.active
                      ? 'Activo'
                      : 'Inactivo'
                  }}
                </span>
              </div>

              <p class="owner-establishment-location">
                {{ locationText(establishment) }}
              </p>

              <p
                v-if="establishment.description"
                class="owner-establishment-description"
              >
                {{ establishment.description }}
              </p>
            </div>

            <span class="owner-establishment-arrow">
              ›
            </span>
          </button>
        </div>

        <div
          v-else
          class="owner-establishments-empty"
        >
          <strong>
            Todavía no tienes establecimientos
          </strong>

          <p>
            Crea tu primer establecimiento para
            comenzar a gestionarlo desde EatsOK.
          </p>
        </div>
      </section>

      <p class="owner-establishments-slogan">
        Everyone can tag along
      </p>
    </main>
  </div>
</template>
