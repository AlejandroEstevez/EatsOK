import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import EstablishmentFilters from '../EstablishmentFilters.vue'

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

const RestrictionCardStub = {
  props: {
    restriction: Object,
    selected: Boolean,
  },

  emits: ['toggle'],

  template: `
    <button
      class="restriction-card-stub"
      :data-id="restriction.id"
      @click="
        $emit(
          'toggle',
          restriction.id
        )
      "
    >
      {{ restriction.name }}
    </button>
  `,
}

const RestrictionSelectorModalStub = {
  props: {
    open: Boolean,
    type: String,
    restrictions: Array,
    selectedRestrictions: Array,
  },

  emits: ['close', 'confirm'],

  template: `
    <div
      class="restriction-selector-modal-stub"
      :data-open="open"
      :data-type="type"
    >
      <button
        v-if="open"
        class="modal-confirm-stub"
        @click="
          $emit(
            'confirm',
            [2]
          )
        "
      >
        Confirm
      </button>

      <button
        v-if="open"
        class="modal-close-stub"
        @click="
          $emit('close')
        "
      >
        Close
      </button>
    </div>
  `,
}

function mountFilters(props = {}) {
  return shallowMount(EstablishmentFilters, {
    props: {
      search: '',
      locationMode: 'current',
      radius: 5,
      useProfile: true,
      restrictions,
      selectedRestrictions: [1, 3],
      ...props,
    },

    global: {
      stubs: {
        RestrictionCard: RestrictionCardStub,

        RestrictionSelectorModal: RestrictionSelectorModalStub,
      },
    },
  })
}

describe('EstablishmentFilters', () => {
  it('renders the current filter values', () => {
    const wrapper = mountFilters({
      search: 'pizza',
      radius: 7,
    })

    expect(wrapper.find('.establishment-search input').element.value).toBe('pizza')

    expect(wrapper.text()).toContain('7km')

    expect(wrapper.find('.radius-slider').element.value).toBe('7')
  })

  it('emits search changes', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.establishment-search input').setValue('sushi')

    expect(wrapper.emitted('update:search')).toEqual([['sushi']])
  })

  it('emits current location mode', async () => {
    const wrapper = mountFilters({
      locationMode: 'map',
    })

    await wrapper.find('input[value="current"]').trigger('change')

    expect(wrapper.emitted('update:location-mode')).toEqual([['current']])
  })

  it('emits map location mode', async () => {
    const wrapper = mountFilters()

    await wrapper.find('input[value="map"]').trigger('change')

    expect(wrapper.emitted('update:location-mode')).toEqual([['map']])
  })

  it('emits radius as a number', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.radius-slider').setValue('8')

    expect(wrapper.emitted('update:radius')).toEqual([[8]])
  })

  it('shows the profile toggle as active when the profile is enabled', () => {
    const wrapper = mountFilters({
      useProfile: true,
    })

    const toggle = wrapper.find('.profile-toggle')

    expect(toggle.classes()).toContain('profile-toggle--active')

    expect(toggle.attributes('aria-pressed')).toBe('true')
  })

  it('emits the opposite profile value when toggled', async () => {
    const wrapper = mountFilters({
      useProfile: true,
    })

    await wrapper.find('.profile-toggle').trigger('click')

    expect(wrapper.emitted('update:use-profile')).toEqual([[false]])
  })

  it('renders only the selected allergies and diets', () => {
    const wrapper = mountFilters({
      selectedRestrictions: [1, 3],
    })

    const cards = wrapper.findAll('.restriction-card-stub')

    expect(cards).toHaveLength(2)

    expect(cards[0].text()).toBe('Gluten')

    expect(cards[1].text()).toBe('Vegano')

    expect(wrapper.text()).not.toContain('Lactosa')

    expect(wrapper.text()).not.toContain('Halal')
  })

  it('forwards restriction toggle events', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.restriction-card-stub').trigger('click')

    expect(wrapper.emitted('toggle-restriction')).toEqual([[1]])
  })

  it('opens the selector for allergies', async () => {
    const wrapper = mountFilters()

    const addButtons = wrapper.findAll('.add-filter-button')

    await addButtons[0].trigger('click')

    const modal = wrapper.find('.restriction-selector-modal-stub')

    expect(modal.attributes('data-open')).toBe('true')

    expect(modal.attributes('data-type')).toBe('allergy')
  })

  it('opens the selector for diets', async () => {
    const wrapper = mountFilters()

    const addButtons = wrapper.findAll('.add-filter-button')

    await addButtons[1].trigger('click')

    const modal = wrapper.find('.restriction-selector-modal-stub')

    expect(modal.attributes('data-open')).toBe('true')

    expect(modal.attributes('data-type')).toBe('diet')
  })

  it('emits replacement restrictions and closes the selector after confirmation', async () => {
    const wrapper = mountFilters()

    const addButtons = wrapper.findAll('.add-filter-button')

    await addButtons[0].trigger('click')

    await wrapper.find('.modal-confirm-stub').trigger('click')

    expect(wrapper.emitted('replace-restrictions')).toEqual([
      [
        {
          type: 'allergy',
          selection: [2],
        },
      ],
    ])

    expect(wrapper.find('.restriction-selector-modal-stub').attributes('data-open')).toBe('false')
  })

  it('closes the selector without replacing restrictions', async () => {
    const wrapper = mountFilters()

    const addButtons = wrapper.findAll('.add-filter-button')

    await addButtons[0].trigger('click')

    await wrapper.find('.modal-close-stub').trigger('click')

    expect(wrapper.emitted('replace-restrictions')).toBeUndefined()

    expect(wrapper.find('.restriction-selector-modal-stub').attributes('data-open')).toBe('false')
  })

  it('emits clear when filters are cleared', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.clear-filters-button').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
