import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import RecipeFilters from '../RecipeFilters.vue'

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
      class="selector-modal-stub"
      :data-open="open"
      :data-type="type"
    >
      <button
        v-if="open"
        class="selector-confirm-stub"
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
        class="selector-close-stub"
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
  return shallowMount(RecipeFilters, {
    props: {
      search: '',
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

describe('RecipeFilters', () => {
  it('renders the current search value', () => {
    const wrapper = mountFilters({
      search: 'pasta',
    })

    expect(wrapper.find('.recipe-search input').element.value).toBe('pasta')
  })

  it('emits search changes', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.recipe-search input').setValue('tarta')

    expect(wrapper.emitted('update:search')).toEqual([['tarta']])
  })

  it('shows the profile toggle as active', () => {
    const wrapper = mountFilters({
      useProfile: true,
    })

    const toggle = wrapper.find('.recipe-profile-toggle')

    expect(toggle.classes()).toContain('recipe-profile-toggle--active')

    expect(toggle.attributes('aria-pressed')).toBe('true')
  })

  it('emits the opposite profile value', async () => {
    const wrapper = mountFilters({
      useProfile: true,
    })

    await wrapper.find('.recipe-profile-toggle').trigger('click')

    expect(wrapper.emitted('update:use-profile')).toEqual([[false]])
  })

  it('renders only selected restrictions', () => {
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

    await wrapper.findAll('.recipe-add-filter-button')[0].trigger('click')

    const modal = wrapper.find('.selector-modal-stub')

    expect(modal.attributes('data-open')).toBe('true')

    expect(modal.attributes('data-type')).toBe('allergy')
  })

  it('opens the selector for diets', async () => {
    const wrapper = mountFilters()

    await wrapper.findAll('.recipe-add-filter-button')[1].trigger('click')

    const modal = wrapper.find('.selector-modal-stub')

    expect(modal.attributes('data-open')).toBe('true')

    expect(modal.attributes('data-type')).toBe('diet')
  })

  it('emits replacement restrictions and closes the selector', async () => {
    const wrapper = mountFilters()

    await wrapper.findAll('.recipe-add-filter-button')[0].trigger('click')

    await wrapper.find('.selector-confirm-stub').trigger('click')

    expect(wrapper.emitted('replace-restrictions')).toEqual([
      [
        {
          type: 'allergy',
          selection: [2],
        },
      ],
    ])

    expect(wrapper.find('.selector-modal-stub').attributes('data-open')).toBe('false')
  })

  it('closes the selector without replacing restrictions', async () => {
    const wrapper = mountFilters()

    await wrapper.findAll('.recipe-add-filter-button')[0].trigger('click')

    await wrapper.find('.selector-close-stub').trigger('click')

    expect(wrapper.emitted('replace-restrictions')).toBeUndefined()

    expect(wrapper.find('.selector-modal-stub').attributes('data-open')).toBe('false')
  })

  it('emits clear', async () => {
    const wrapper = mountFilters()

    await wrapper.find('.recipe-clear-filters-button').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
