import { beforeEach, describe, expect, it, vi } from 'vitest'

import { nextTick } from 'vue'

import { shallowMount } from '@vue/test-utils'

const leafletMock = vi.hoisted(() => {
  const mapHandlers = {}

  const mapInstance = {
    setView: vi.fn(),
    on: vi.fn((event, handler) => {
      mapHandlers[event] = handler

      return mapInstance
    }),
    invalidateSize: vi.fn(),
    remove: vi.fn(),
  }

  mapInstance.setView.mockReturnValue(mapInstance)

  const tileLayerInstance = {
    addTo: vi.fn(() => tileLayerInstance),
  }

  const layerGroupInstance = {
    addTo: vi.fn(() => layerGroupInstance),
    clearLayers: vi.fn(),
  }

  const markers = []
  const circleMarkers = []

  const map = vi.fn(() => mapInstance)

  const tileLayer = vi.fn(() => tileLayerInstance)

  const layerGroup = vi.fn(() => layerGroupInstance)

  const divIcon = vi.fn((options) => ({
    ...options,
    __leafletIcon: true,
  }))

  const marker = vi.fn((coordinates, options) => {
    const handlers = {}

    const element = {
      classList: {
        toggle: vi.fn(),
      },
    }

    const markerInstance = {
      coordinates,
      options,
      handlers,
      element,

      bindTooltip: vi.fn(() => markerInstance),

      on: vi.fn((event, handler) => {
        handlers[event] = handler

        return markerInstance
      }),

      addTo: vi.fn(() => markerInstance),

      getElement: vi.fn(() => element),

      setZIndexOffset: vi.fn(),

      openTooltip: vi.fn(),

      closeTooltip: vi.fn(),
    }

    markers.push(markerInstance)

    return markerInstance
  })

  const circleMarker = vi.fn((coordinates, options) => {
    const circleMarkerInstance = {
      coordinates,
      options,

      addTo: vi.fn(() => circleMarkerInstance),

      remove: vi.fn(),
    }

    circleMarkers.push(circleMarkerInstance)

    return circleMarkerInstance
  })

  return {
    map,
    tileLayer,
    layerGroup,
    divIcon,
    marker,
    circleMarker,

    mapInstance,
    tileLayerInstance,
    layerGroupInstance,

    mapHandlers,
    markers,
    circleMarkers,
  }
})

vi.mock('leaflet', () => ({
  default: {
    map: leafletMock.map,

    tileLayer: leafletMock.tileLayer,

    layerGroup: leafletMock.layerGroup,

    divIcon: leafletMock.divIcon,

    marker: leafletMock.marker,

    circleMarker: leafletMock.circleMarker,
  },
}))

import EstablishmentMap from '../EstablishmentMap.vue'

const establishments = [
  {
    id: 1,
    name: 'Restaurante Verde',
    compatible_percentage: 90,

    location: {
      latitude: 40.4168,
      longitude: -3.7038,
    },
  },

  {
    id: 2,
    name: 'Restaurante Amarillo',
    compatible_percentage: 60,

    location: {
      latitude: 40.42,
      longitude: -3.71,
    },
  },

  {
    id: 3,
    name: 'Restaurante Rojo',
    compatible_percentage: 20,

    location: {
      latitude: 40.41,
      longitude: -3.69,
    },
  },

  {
    id: 4,
    name: 'Sin coordenadas',
    compatible_percentage: 100,

    location: null,
  },
]

function mountMap(props = {}) {
  return shallowMount(EstablishmentMap, {
    props: {
      establishments,
      selectedLocation: null,
      allowSelection: false,
      hoveredEstablishmentId: null,
      ...props,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  leafletMock.markers.length = 0
  leafletMock.circleMarkers.length = 0

  Object.keys(leafletMock.mapHandlers).forEach((key) => {
    delete leafletMock.mapHandlers[key]
  })
})

describe('EstablishmentMap', () => {
  it('initializes the Leaflet map centered in Madrid', () => {
    mountMap()

    expect(leafletMock.map).toHaveBeenCalledWith('establishment-map', {
      zoomControl: true,
    })

    expect(leafletMock.mapInstance.setView).toHaveBeenCalledWith([40.4168, -3.7038], 14)

    expect(leafletMock.tileLayer).toHaveBeenCalledTimes(1)

    expect(leafletMock.layerGroup).toHaveBeenCalledTimes(1)
  })

  it('creates markers only for establishments with coordinates', () => {
    mountMap()

    expect(leafletMock.marker).toHaveBeenCalledTimes(3)

    expect(leafletMock.marker).toHaveBeenNthCalledWith(
      1,
      [40.4168, -3.7038],
      expect.objectContaining({
        icon: expect.any(Object),
      })
    )

    expect(leafletMock.markers[0].bindTooltip).toHaveBeenCalledWith('Restaurante Verde', {
      direction: 'top',
      offset: [0, -10],
    })
  })

  it('uses different marker colors according to compatibility', () => {
    mountMap()

    expect(leafletMock.divIcon).toHaveBeenCalledTimes(3)

    const highIcon = leafletMock.divIcon.mock.calls[0][0]

    const mediumIcon = leafletMock.divIcon.mock.calls[1][0]

    const lowIcon = leafletMock.divIcon.mock.calls[2][0]

    expect(highIcon.html).toContain('#57b313')

    expect(mediumIcon.html).toContain('#ffb400')

    expect(lowIcon.html).toContain('#e02d19')
  })

  it('emits the establishment when its marker is clicked', () => {
    const wrapper = mountMap()

    leafletMock.markers[1].handlers.click()

    expect(wrapper.emitted('select-establishment')).toEqual([[establishments[1]]])
  })

  it('does not select a location when map selection is disabled', () => {
    const wrapper = mountMap({
      allowSelection: false,
    })

    leafletMock.mapHandlers.click({
      latlng: {
        lat: 40.5,
        lng: -3.8,
      },
    })

    expect(wrapper.emitted('select-location')).toBeUndefined()
  })

  it('emits coordinates when clicking the map in selection mode', async () => {
    const wrapper = mountMap({
      allowSelection: false,
    })

    await wrapper.setProps({
      allowSelection: true,
    })

    leafletMock.mapHandlers.click({
      latlng: {
        lat: 40.5,
        lng: -3.8,
      },
    })

    expect(wrapper.emitted('select-location')).toEqual([
      [
        {
          latitude: 40.5,
          longitude: -3.8,
        },
      ],
    ])
  })

  it('renders the selected search location', () => {
    mountMap({
      selectedLocation: {
        latitude: 40.45,
        longitude: -3.72,
      },
    })

    expect(leafletMock.circleMarker).toHaveBeenCalledWith([40.45, -3.72], {
      radius: 9,
      weight: 3,
      fillOpacity: 1,
    })

    expect(leafletMock.circleMarkers[0].addTo).toHaveBeenCalledWith(leafletMock.mapInstance)
  })

  it('replaces the selected location marker when the location changes', async () => {
    const wrapper = mountMap({
      selectedLocation: {
        latitude: 40.4,
        longitude: -3.7,
      },
    })

    const firstMarker = leafletMock.circleMarkers[0]

    await wrapper.setProps({
      selectedLocation: {
        latitude: 41,
        longitude: -4,
      },
    })

    await nextTick()

    expect(firstMarker.remove).toHaveBeenCalledTimes(1)

    expect(leafletMock.circleMarker).toHaveBeenLastCalledWith([41, -4], {
      radius: 9,
      weight: 3,
      fillOpacity: 1,
    })
  })

  it('removes the selected marker when selected location is cleared', async () => {
    const wrapper = mountMap({
      selectedLocation: {
        latitude: 40.4,
        longitude: -3.7,
      },
    })

    const marker = leafletMock.circleMarkers[0]

    await wrapper.setProps({
      selectedLocation: null,
    })

    await nextTick()

    expect(marker.remove).toHaveBeenCalledTimes(1)

    expect(leafletMock.circleMarker).toHaveBeenCalledTimes(1)
  })

  it('highlights the marker corresponding to the hovered result', async () => {
    const wrapper = mountMap()

    const firstMarker = leafletMock.markers[0]

    const secondMarker = leafletMock.markers[1]

    await wrapper.setProps({
      hoveredEstablishmentId: 2,
    })

    await nextTick()

    expect(secondMarker.element.classList.toggle).toHaveBeenLastCalledWith(
      'compatibility-marker-wrapper--hovered',
      true
    )

    expect(secondMarker.setZIndexOffset).toHaveBeenLastCalledWith(1000)

    expect(secondMarker.openTooltip).toHaveBeenCalled()

    expect(firstMarker.element.classList.toggle).toHaveBeenLastCalledWith(
      'compatibility-marker-wrapper--hovered',
      false
    )

    expect(firstMarker.setZIndexOffset).toHaveBeenLastCalledWith(0)

    expect(firstMarker.closeTooltip).toHaveBeenCalled()
  })

  it('removes the marker highlight when hover ends', async () => {
    const wrapper = mountMap({
      hoveredEstablishmentId: 1,
    })

    const firstMarker = leafletMock.markers[0]

    expect(firstMarker.setZIndexOffset).toHaveBeenLastCalledWith(1000)

    await wrapper.setProps({
      hoveredEstablishmentId: null,
    })

    await nextTick()

    expect(firstMarker.element.classList.toggle).toHaveBeenLastCalledWith(
      'compatibility-marker-wrapper--hovered',
      false
    )

    expect(firstMarker.setZIndexOffset).toHaveBeenLastCalledWith(0)

    expect(firstMarker.closeTooltip).toHaveBeenCalled()
  })

  it('re-renders establishment markers when establishments change', async () => {
    const wrapper = mountMap()

    expect(leafletMock.layerGroupInstance.clearLayers).toHaveBeenCalledTimes(1)

    await wrapper.setProps({
      establishments: [
        {
          id: 5,
          name: 'Nuevo',
          compatible_percentage: 95,

          location: {
            latitude: 41,
            longitude: -4,
          },
        },
      ],
    })

    await nextTick()

    expect(leafletMock.layerGroupInstance.clearLayers).toHaveBeenCalledTimes(2)

    expect(leafletMock.marker).toHaveBeenCalledTimes(4)

    expect(leafletMock.marker).toHaveBeenLastCalledWith(
      [41, -4],
      expect.objectContaining({
        icon: expect.any(Object),
      })
    )
  })

  it('removes the Leaflet map when the component is unmounted', () => {
    const wrapper = mountMap()

    wrapper.unmount()

    expect(leafletMock.mapInstance.remove).toHaveBeenCalledTimes(1)
  })
})
