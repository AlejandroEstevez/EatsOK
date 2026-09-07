import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

import { nextTick } from 'vue'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  push: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: {
    get: mocks.get,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

import EstablishmentsView from '../EstablishmentsView.vue'

const restrictions = [
  {
    id: 1,
    name: 'Gluten',
    type: 'allergy',
  },
  {
    id: 2,
    name: 'Lactosa',
    type: 'allergy',
  },
  {
    id: 3,
    name: 'Vegano',
    type: 'diet',
  },
  {
    id: 4,
    name: 'Halal',
    type: 'diet',
  },
]

const establishments = [
  {
    id: 10,
    name: 'Restaurante Uno',
    compatible_percentage: 100,
  },
  {
    id: 20,
    name: 'Restaurante Dos',
    compatible_percentage: 75,
  },
]

const EstablishmentFiltersStub = {
  name: 'EstablishmentFiltersStub',

  props: {
    search: String,
    locationMode: String,
    radius: Number,
    useProfile: Boolean,
    restrictions: Array,
    selectedRestrictions: Array,
  },

  emits: [
    'update:search',
    'update:location-mode',
    'update:radius',
    'update:use-profile',
    'replace-restrictions',
    'toggle-restriction',
    'clear',
  ],

  template: `
    <aside class="filters-stub"></aside>
  `,
}

const EstablishmentMapStub = {
  name: 'EstablishmentMapStub',

  props: {
    establishments: Array,
    selectedLocation: Object,
    hoveredEstablishmentId: Number,
    allowSelection: Boolean,
  },

  emits: ['select-location', 'select-establishment'],

  template: `
    <section class="map-stub"></section>
  `,
}

const EstablishmentResultsStub = {
  name: 'EstablishmentResultsStub',

  props: {
    establishments: Array,
    loading: Boolean,
    ordering: String,
  },

  emits: ['update:ordering', 'select-establishment', 'hover-establishment', 'leave-establishment'],

  template: `
    <aside class="results-stub"></aside>
  `,
}

function mockSuccessfulRequests() {
  mocks.get.mockImplementation((url) => {
    if (url === '/food-profiles/restrictions/') {
      return Promise.resolve({
        data: restrictions,
      })
    }

    if (url === '/food-profiles/') {
      return Promise.resolve({
        data: {
          restrictions: [
            {
              id: 1,
              name: 'Gluten',
            },
            {
              id: 3,
              name: 'Vegano',
            },
          ],
        },
      })
    }

    if (url === '/search/establishments/') {
      return Promise.resolve({
        data: establishments,
      })
    }

    return Promise.reject(new Error(`Unexpected endpoint: ${url}`))
  })
}

function mountView() {
  return shallowMount(EstablishmentsView, {
    global: {
      stubs: {
        NavBar: true,

        EstablishmentFilters: EstablishmentFiltersStub,

        EstablishmentMap: EstablishmentMapStub,

        EstablishmentResults: EstablishmentResultsStub,
      },
    },
  })
}

async function mountLoadedView() {
  mockSuccessfulRequests()

  const wrapper = mountView()

  await flushPromises()
  await nextTick()

  return wrapper
}

function getSearchCalls() {
  return mocks.get.mock.calls.filter(([url]) => url === '/search/establishments/')
}

function getLastSearchParams() {
  const calls = getSearchCalls()

  return calls[calls.length - 1][1].params
}

beforeEach(() => {
  mocks.get.mockReset()
  mocks.push.mockReset()
})

describe('EstablishmentsView', () => {
  it('loads restrictions, profile and establishments', async () => {
    const wrapper = await mountLoadedView()

    expect(mocks.get).toHaveBeenCalledWith('/food-profiles/restrictions/')

    expect(mocks.get).toHaveBeenCalledWith('/food-profiles/')

    expect(getSearchCalls().length).toBeGreaterThan(0)

    const results = wrapper.findComponent({
      name: 'EstablishmentResultsStub',
    })

    expect(results.props('establishments')).toEqual(establishments)
  })

  it('initially applies the food profile restrictions', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    expect(filters.props('useProfile')).toBe(true)

    expect(filters.props('selectedRestrictions')).toEqual([1, 3])

    expect(getLastSearchParams()).toEqual({
      search: undefined,
      use_profile: true,
      restrictions: '1,3',
      ordering: 'distance',
    })
  })

  it('updates the search term and reloads establishments', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('update:search', 'pizza')

    await nextTick()
    await flushPromises()

    expect(filters.props('search')).toBe('pizza')

    expect(getLastSearchParams().search).toBe('pizza')
  })

  it('manually toggles a restriction and disables profile mode', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('toggle-restriction', 2)

    await nextTick()
    await flushPromises()

    expect(filters.props('selectedRestrictions')).toEqual([1, 3, 2])

    expect(filters.props('useProfile')).toBe(false)

    const params = getLastSearchParams()

    expect(params.use_profile).toBe(false)

    expect(params.restrictions).toBe('1,3,2')
  })

  it('removes an already selected restriction', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('toggle-restriction', 1)

    await nextTick()
    await flushPromises()

    expect(filters.props('selectedRestrictions')).toEqual([3])

    expect(filters.props('useProfile')).toBe(false)
  })

  it('restores profile restrictions without creating duplicates', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('toggle-restriction', 2)

    await nextTick()
    await flushPromises()

    filters.vm.$emit('update:use-profile', true)

    await nextTick()
    await flushPromises()

    expect(filters.props('useProfile')).toBe(true)

    expect(filters.props('selectedRestrictions')).toEqual([1, 3, 2])
  })

  it('replaces restrictions of one type while preserving the other type', async () => {
    const wrapper = await mountLoadedView()

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('replace-restrictions', {
      type: 'allergy',
      selection: [2],
    })

    await nextTick()
    await flushPromises()

    expect(filters.props('selectedRestrictions')).toEqual([3, 2])

    expect(filters.props('useProfile')).toBe(false)

    expect(getLastSearchParams().restrictions).toBe('3,2')
  })

  it('selects a location on the map and includes it in the search', async () => {
    const wrapper = await mountLoadedView()

    const map = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    map.vm.$emit('select-location', {
      latitude: 40.4168,
      longitude: -3.7038,
    })

    await nextTick()
    await flushPromises()

    const updatedMap = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    const filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    expect(filters.props('locationMode')).toBe('map')

    expect(updatedMap.props('selectedLocation')).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
    })

    expect(updatedMap.props('allowSelection')).toBe(true)

    expect(getLastSearchParams()).toMatchObject({
      latitude: 40.4168,
      longitude: -3.7038,
      radius: 5,
    })
  })

  it('updates result ordering and reloads establishments', async () => {
    const wrapper = await mountLoadedView()

    const results = wrapper.findComponent({
      name: 'EstablishmentResultsStub',
    })

    results.vm.$emit('update:ordering', '-rating')

    await nextTick()
    await flushPromises()

    expect(results.props('ordering')).toBe('-rating')

    expect(getLastSearchParams().ordering).toBe('-rating')
  })

  it('sends hovered establishment to the map and clears it on leave', async () => {
    const wrapper = await mountLoadedView()

    const results = wrapper.findComponent({
      name: 'EstablishmentResultsStub',
    })

    results.vm.$emit('hover-establishment', 20)

    await nextTick()

    let map = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    expect(map.props('hoveredEstablishmentId')).toBe(20)

    results.vm.$emit('leave-establishment')

    await nextTick()

    map = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    expect(map.props('hoveredEstablishmentId')).toBeNull()
  })

  it('navigates to establishment detail when a result is selected', async () => {
    const wrapper = await mountLoadedView()

    const results = wrapper.findComponent({
      name: 'EstablishmentResultsStub',
    })

    results.vm.$emit('select-establishment', establishments[0])

    await nextTick()

    expect(mocks.push).toHaveBeenCalledWith({
      name: 'establishment-detail',

      params: {
        id: 10,
      },
    })
  })

  it('also navigates to detail when an establishment is selected on the map', async () => {
    const wrapper = await mountLoadedView()

    const map = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    map.vm.$emit('select-establishment', establishments[1])

    await nextTick()

    expect(mocks.push).toHaveBeenCalledWith({
      name: 'establishment-detail',

      params: {
        id: 20,
      },
    })
  })

  it('clears all filters', async () => {
    const wrapper = await mountLoadedView()

    let filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    const map = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    filters.vm.$emit('update:search', 'pizza')

    filters.vm.$emit('update:radius', 9)

    map.vm.$emit('select-location', {
      latitude: 40,
      longitude: -3,
    })

    await nextTick()
    await flushPromises()

    filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    filters.vm.$emit('clear')

    await nextTick()
    await flushPromises()

    filters = wrapper.findComponent({
      name: 'EstablishmentFiltersStub',
    })

    const updatedMap = wrapper.findComponent({
      name: 'EstablishmentMapStub',
    })

    expect(filters.props('search')).toBe('')

    expect(filters.props('locationMode')).toBe('current')

    expect(filters.props('radius')).toBe(5)

    expect(filters.props('useProfile')).toBe(false)

    expect(filters.props('selectedRestrictions')).toEqual([])

    expect(updatedMap.props('selectedLocation')).toBeNull()

    expect(getLastSearchParams()).toEqual({
      search: undefined,
      use_profile: false,
      restrictions: undefined,
      ordering: 'distance',
    })
  })

  it('shows no establishments when the search request fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mocks.get.mockImplementation((url) => {
      if (url === '/food-profiles/restrictions/') {
        return Promise.resolve({
          data: restrictions,
        })
      }

      if (url === '/food-profiles/') {
        return Promise.resolve({
          data: {
            restrictions: [],
          },
        })
      }

      if (url === '/search/establishments/') {
        return Promise.reject(new Error('Search error'))
      }

      return Promise.reject(new Error('Unknown endpoint'))
    })

    const wrapper = mountView()

    await flushPromises()
    await nextTick()

    const results = wrapper.findComponent({
      name: 'EstablishmentResultsStub',
    })

    expect(results.props('establishments')).toEqual([])

    expect(results.props('loading')).toBe(false)

    consoleSpy.mockRestore()
  })
})
