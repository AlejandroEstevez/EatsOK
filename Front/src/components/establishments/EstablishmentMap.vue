<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import './EstablishmentMap.css'

const props = defineProps({
  establishments: {
    type: Array,
    default: () => [],
  },

  selectedLocation: {
    type: Object,
    default: null,
  },

  allowSelection: {
    type: Boolean,
    default: false,
  },

  hoveredEstablishmentId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['select-location', 'select-establishment'])

const establishmentMarkers = new Map()

let map = null
let markerLayer = null
let selectedMarker = null

function getCompatibilityColor(percentage) {
  if (percentage >= 80) {
    return '#57b313'
  }

  if (percentage >= 40) {
    return '#ffb400'
  }

  return '#e02d19'
}

function createCompatibilityIcon(percentage) {
  const color = getCompatibilityColor(percentage)

  return L.divIcon({
    className: 'compatibility-marker-wrapper',
    html: `
      <svg
        width="42"
        height="52"
        viewBox="0 0 42 52"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 1
             C10 1 2 9 2 20
             C2 34 21 51 21 51
             C21 51 40 34 40 20
             C40 9 32 1 21 1Z"
          fill="${color}"
          stroke="white"
          stroke-width="3"
        />

        <circle
          cx="21"
          cy="20"
          r="7"
          fill="white"
        />
      </svg>
    `,
    iconSize: [42, 52],
    iconAnchor: [21, 50],
    tooltipAnchor: [0, -44],
  })
}

function renderEstablishments() {
  if (!map || !markerLayer) {
    return
  }

  markerLayer.clearLayers()
  establishmentMarkers.clear()

  props.establishments.forEach((establishment) => {
    const latitude = establishment.location?.latitude
    const longitude = establishment.location?.longitude

    if (latitude == null || longitude == null) {
      return
    }

    const marker = L.marker([latitude, longitude], {
      icon: createCompatibilityIcon(establishment.compatible_percentage),
    })

    marker.bindTooltip(establishment.name, {
      direction: 'top',
      offset: [0, -10],
    })

    marker.on('click', () => {
      emit('select-establishment', establishment)
    })

    marker.addTo(markerLayer)

    establishmentMarkers.set(establishment.id, marker)
  })

  updateHoveredMarker()
}

function renderSelectedLocation() {
  if (!map) {
    return
  }

  if (selectedMarker) {
    selectedMarker.remove()
    selectedMarker = null
  }

  if (!props.selectedLocation) {
    return
  }

  selectedMarker = L.circleMarker(
    [props.selectedLocation.latitude, props.selectedLocation.longitude],
    {
      radius: 9,
      weight: 3,
      fillOpacity: 1,
    }
  ).addTo(map)
}

function updateHoveredMarker() {
  establishmentMarkers.forEach((marker, id) => {
    const element = marker.getElement()

    if (!element) {
      return
    }

    const hovered = id === props.hoveredEstablishmentId

    element.classList.toggle('compatibility-marker-wrapper--hovered', hovered)

    marker.setZIndexOffset(hovered ? 1000 : 0)

    if (hovered) {
      marker.openTooltip()
    } else {
      marker.closeTooltip()
    }
  })
}

onMounted(() => {
  map = L.map('establishment-map', {
    zoomControl: true,
  }).setView([40.4168, -3.7038], 14)

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://stadiamaps.com/attribution/" target="_blank">Stadia Maps</a> ' +
      '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  }).addTo(map)

  markerLayer = L.layerGroup().addTo(map)

  map.on('click', (event) => {
    if (!props.allowSelection) {
      return
    }

    emit('select-location', {
      latitude: event.latlng.lat,
      longitude: event.latlng.lng,
    })
  })

  renderEstablishments()
  renderSelectedLocation()

  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 0)
})

watch(
  () => props.establishments,
  () => {
    renderEstablishments()
  },
  {
    deep: true,
  }
)

watch(
  () => props.selectedLocation,
  () => {
    renderSelectedLocation()
  },
  {
    deep: true,
  }
)

watch(
  () => props.hoveredEstablishmentId,
  () => {
    updateHoveredMarker()
  }
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }

  establishmentMarkers.clear()
})
</script>

<template>
  <section class="establishment-map-wrapper">
    <div id="establishment-map" class="establishment-map"></div>

    <div class="map-legend">
      <div class="map-legend-item">
        <span class="map-legend-dot map-legend-dot--high"></span>
        <span>Alta compatibilidad</span>
      </div>

      <div class="map-legend-item">
        <span class="map-legend-dot map-legend-dot--medium"></span>
        <span>Compatibilidad media</span>
      </div>

      <div class="map-legend-item">
        <span class="map-legend-dot map-legend-dot--low"></span>
        <span>Baja compatibilidad</span>
      </div>
    </div>
  </section>
</template>
