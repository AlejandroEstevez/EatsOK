import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: {
    get: mocks.get,
    patch: mocks.patch,
  },
}))

import FoodProfileView from '../FoodProfileView.vue'

const restrictions = [
  {
    id: 1,
    name: 'Gluten',
    type: 'allergy',
  },
  {
    id: 2,
    name: 'Lácteos',
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

const profile = {
  restrictions: [restrictions[0], restrictions[2]],
}

const RestrictionCardStub = {
  props: {
    restriction: Object,
    selected: Boolean,
    summary: Boolean,
  },

  emits: ['toggle'],

  template: `
    <button
      class="restriction-card-stub"
      :data-id="restriction.id"
      :data-selected="selected"
      :data-summary="summary"
      @click="$emit('toggle', restriction.id)"
    >
      {{ restriction.name }}
    </button>
  `,
}

function mockProfileLoad() {
  mocks.get.mockImplementation((url) => {
    if (url === '/food-profiles/restrictions/') {
      return Promise.resolve({
        data: restrictions,
      })
    }

    if (url === '/food-profiles/') {
      return Promise.resolve({
        data: profile,
      })
    }

    return Promise.reject(new Error('Unknown endpoint'))
  })
}

function mountFoodProfile() {
  return shallowMount(FoodProfileView, {
    global: {
      stubs: {
        NavBar: true,
        RestrictionCard: RestrictionCardStub,
      },
    },
  })
}

async function mountLoadedProfile() {
  mockProfileLoad()

  const wrapper = mountFoodProfile()

  await flushPromises()

  return wrapper
}

beforeEach(() => {
  mocks.get.mockReset()
  mocks.patch.mockReset()
})

describe('FoodProfileView', () => {
  it('loads restrictions and the current food profile', async () => {
    const wrapper = await mountLoadedProfile()

    expect(mocks.get).toHaveBeenCalledTimes(2)

    expect(mocks.get).toHaveBeenCalledWith('/food-profiles/restrictions/')

    expect(mocks.get).toHaveBeenCalledWith('/food-profiles/')

    expect(wrapper.text()).not.toContain('Cargando perfil...')
  })

  it('shows an error when the profile cannot be loaded', async () => {
    mocks.get.mockRejectedValue(new Error('Server error'))

    const wrapper = mountFoodProfile()

    await flushPromises()

    expect(wrapper.find('.profile-error').text()).toBe(
      'No se ha podido cargar tu perfil alimentario.'
    )

    expect(wrapper.find('.profile-loading').exists()).toBe(false)
  })

  it('separates allergies and diets', async () => {
    const wrapper = await mountLoadedProfile()

    const allergyCards = wrapper.find('.allergies-grid').findAll('.restriction-card-stub')

    const dietCards = wrapper.find('.diets-grid').findAll('.restriction-card-stub')

    expect(allergyCards).toHaveLength(2)

    expect(allergyCards[0].text()).toBe('Gluten')

    expect(allergyCards[1].text()).toBe('Lácteos')

    expect(dietCards).toHaveLength(2)

    expect(dietCards[0].text()).toBe('Vegano')

    expect(dietCards[1].text()).toBe('Halal')
  })

  it('shows the selected restrictions in the profile summary', async () => {
    const wrapper = await mountLoadedProfile()

    const summaryCards = wrapper.find('.summary-restrictions').findAll('.restriction-card-stub')

    expect(summaryCards).toHaveLength(2)

    expect(summaryCards[0].text()).toBe('Gluten')

    expect(summaryCards[1].text()).toBe('Vegano')
  })

  it('marks current restrictions as selected', async () => {
    const wrapper = await mountLoadedProfile()

    const cards = wrapper.findAll('.restriction-card-stub')

    const glutenCard = cards.find(
      (card) => card.attributes('data-id') === '1' && card.attributes('data-summary') === 'false'
    )

    const milkCard = cards.find((card) => card.attributes('data-id') === '2')

    expect(glutenCard.attributes('data-selected')).toBe('true')

    expect(milkCard.attributes('data-selected')).toBe('false')
  })

  it('adds a restriction when it is selected', async () => {
    const wrapper = await mountLoadedProfile()

    const milkCard = wrapper
      .find('.allergies-grid')
      .findAll('.restriction-card-stub')
      .find((card) => card.attributes('data-id') === '2')

    await milkCard.trigger('click')

    const summaryCards = wrapper.find('.summary-restrictions').findAll('.restriction-card-stub')

    expect(summaryCards).toHaveLength(3)

    expect(summaryCards.some((card) => card.text() === 'Lácteos')).toBe(true)
  })

  it('removes a restriction when it is selected again', async () => {
    const wrapper = await mountLoadedProfile()

    const glutenCard = wrapper
      .find('.allergies-grid')
      .findAll('.restriction-card-stub')
      .find((card) => card.attributes('data-id') === '1')

    await glutenCard.trigger('click')

    const summaryCards = wrapper.find('.summary-restrictions').findAll('.restriction-card-stub')

    expect(summaryCards).toHaveLength(1)

    expect(summaryCards[0].text()).toBe('Vegano')
  })

  it('shows the empty summary when no restriction is selected', async () => {
    mocks.get.mockImplementation((url) => {
      if (url === '/food-profiles/restrictions/') {
        return Promise.resolve({
          data: restrictions,
        })
      }

      return Promise.resolve({
        data: {
          restrictions: [],
        },
      })
    })

    const wrapper = mountFoodProfile()

    await flushPromises()

    expect(wrapper.find('.empty-profile').text()).toBe(
      'Todavía no has seleccionado ninguna restricción.'
    )
  })

  it('saves the selected restriction ids', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = await mountLoadedProfile()

    await wrapper.find('.save-profile-button').trigger('click')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledTimes(1)

    expect(mocks.patch).toHaveBeenCalledWith('/food-profiles/', {
      restriction_ids: [1, 3],
    })
  })

  it('saves changes made to the selected restrictions', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = await mountLoadedProfile()

    const milkCard = wrapper
      .find('.allergies-grid')
      .findAll('.restriction-card-stub')
      .find((card) => card.attributes('data-id') === '2')

    await milkCard.trigger('click')

    await wrapper.find('.save-profile-button').trigger('click')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledWith('/food-profiles/', {
      restriction_ids: [1, 3, 2],
    })
  })

  it('shows the success modal after saving', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = await mountLoadedProfile()

    await wrapper.find('.save-profile-button').trigger('click')

    await flushPromises()

    expect(wrapper.find('.profile-modal-overlay').exists()).toBe(true)

    expect(wrapper.text()).toContain('Perfil actualizado')
  })

  it('closes the success modal', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = await mountLoadedProfile()

    await wrapper.find('.save-profile-button').trigger('click')

    await flushPromises()

    await wrapper.find('.profile-modal button').trigger('click')

    expect(wrapper.find('.profile-modal-overlay').exists()).toBe(false)
  })

  it('shows an error when saving fails', async () => {
    mocks.patch.mockRejectedValueOnce(new Error('Server error'))

    const wrapper = await mountLoadedProfile()

    await wrapper.find('.save-profile-button').trigger('click')

    await flushPromises()

    expect(wrapper.find('.profile-error').text()).toBe('No se han podido guardar los cambios.')

    expect(wrapper.find('.profile-modal-overlay').exists()).toBe(false)
  })

  it('shows loading state while saving', async () => {
    let resolvePatch

    mocks.patch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve
        })
    )

    const wrapper = await mountLoadedProfile()

    await wrapper.find('.save-profile-button').trigger('click')

    expect(wrapper.find('.save-profile-button').text()).toBe('Guardando...')

    expect(wrapper.find('.save-profile-button').attributes('disabled')).toBeDefined()

    resolvePatch({
      data: {},
    })

    await flushPromises()

    expect(wrapper.find('.save-profile-button').text()).toBe('Guardar cambios')

    expect(wrapper.find('.save-profile-button').attributes('disabled')).toBeUndefined()
  })
})
