<script setup>
import { onMounted, reactive, ref, watch } from 'vue'

import './EstablishmentsView.css'

import NavBar from '../components/common/NavBar.vue'
import EstablishmentFilters from '../components/establishments/EstablishmentFilters.vue'
import EstablishmentMap from '../components/establishments/EstablishmentMap.vue'
import EstablishmentResults from '../components/establishments/EstablishmentResults.vue'

import api from '../services/api'

import { useRouter } from 'vue-router'

const filters = reactive({
  search: '',
  locationMode: 'current',
  radius: 5,
  useProfile: true,
  selectedRestrictions: [],
  ordering: 'distance',
})

const restrictions = reactive({
  all: [],
  profile: [],
})

const selectedLocation = ref(null)
const hoveredEstablishmentId = ref(null)
const establishments = ref([])
const loadingEstablishments = ref(false)

const router = useRouter()

/* FILTER PANEL */

async function loadRestrictions() {
  const [restrictionsResponse, profileResponse] = await Promise.all([
    api.get('/food-profiles/restrictions/'),
    api.get('/food-profiles/'),
  ])

  restrictions.all = restrictionsResponse.data

  restrictions.profile = profileResponse.data.restrictions.map(
    (restriction) => restriction.id ?? restriction
  )

  if (filters.useProfile) {
    filters.selectedRestrictions = [...restrictions.profile]
  }
}

function toggleRestriction(restrictionId) {
  if (filters.selectedRestrictions.includes(restrictionId)) {
    filters.selectedRestrictions = filters.selectedRestrictions.filter((id) => id !== restrictionId)
  } else {
    filters.selectedRestrictions.push(restrictionId)
  }

  filters.useProfile = false
}

function toggleProfile(value) {
  filters.useProfile = value

  if (value) {
    filters.selectedRestrictions = [
      ...new Set([...filters.selectedRestrictions, ...restrictions.profile]),
    ]
  }
}

function replaceRestrictions({ type, selection }) {
  const otherTypeIds = restrictions.all
    .filter(
      (restriction) =>
        restriction.type !== type && filters.selectedRestrictions.includes(restriction.id)
    )
    .map((restriction) => restriction.id)

  filters.selectedRestrictions = [...otherTypeIds, ...selection]

  filters.useProfile = false
}

function clearFilters() {
  filters.search = ''
  filters.locationMode = 'current'
  filters.radius = 5
  filters.useProfile = false
  filters.selectedRestrictions = []
  filters.ordering = 'distance'
  selectedLocation.value = null
}

/* MAP PANEL */

async function loadEstablishments() {
  loadingEstablishments.value = true

  try {
    const params = {
      search: filters.search || undefined,
      use_profile: filters.useProfile,
      restrictions: filters.selectedRestrictions.length
        ? filters.selectedRestrictions.join(',')
        : undefined,
      ordering: filters.ordering || undefined,
    }

    if (selectedLocation.value) {
      params.latitude = selectedLocation.value.latitude
      params.longitude = selectedLocation.value.longitude
      params.radius = filters.radius
    }

    const response = await api.get('/search/establishments/', { params })

    establishments.value = response.data
  } catch (error) {
    console.error('Error loading establishments:', error)

    establishments.value = []
  } finally {
    loadingEstablishments.value = false
  }
}

function selectLocation(location) {
  selectedLocation.value = location
  filters.locationMode = 'map'
}

function selectEstablishment(establishment) {
  router.push({
    name: 'establishment-detail',
    params: {
      id: establishment.id,
    },
  })
}

/* RESULTS PANEL */

function updateOrdering(ordering) {
  filters.ordering = ordering
}

/* WATCHERS */

watch(
  [
    () => filters.search,
    () => filters.radius,
    () => filters.useProfile,
    () => filters.selectedRestrictions,
    () => filters.ordering,
    selectedLocation,
  ],
  () => {
    loadEstablishments()
  },
  {
    deep: true,
  }
)

/* INITIALIZATION */

onMounted(async () => {
  await loadRestrictions()
  await loadEstablishments()
})
</script>

<template>
  <div class="establishments-page">
    <NavBar />

    <main class="establishments-layout">
      <!-- FILTER PANEL -->

      <EstablishmentFilters
        :search="filters.search"
        :location-mode="filters.locationMode"
        :radius="filters.radius"
        :use-profile="filters.useProfile"
        :restrictions="restrictions.all"
        :selected-restrictions="filters.selectedRestrictions"
        @update:search="filters.search = $event"
        @update:location-mode="filters.locationMode = $event"
        @update:radius="filters.radius = $event"
        @update:use-profile="toggleProfile"
        @replace-restrictions="replaceRestrictions"
        @toggle-restriction="toggleRestriction"
        @clear="clearFilters"
      />

      <!-- MAP PANEL -->

      <EstablishmentMap
        :establishments="establishments"
        :selected-location="selectedLocation"
        :hovered-establishment-id="hoveredEstablishmentId"
        :allow-selection="filters.locationMode === 'map'"
        @select-location="selectLocation"
        @select-establishment="selectEstablishment"
      />

      <!-- RESULTS PANEL -->

      <EstablishmentResults
        :establishments="establishments"
        :loading="loadingEstablishments"
        :ordering="filters.ordering"
        @update:ordering="updateOrdering"
        @select-establishment="selectEstablishment"
        @hover-establishment="hoveredEstablishmentId = $event"
        @leave-establishment="hoveredEstablishmentId = null"
      />
    </main>

    <p class="establishments-slogan">Everyone can tag along</p>
  </div>
</template>
