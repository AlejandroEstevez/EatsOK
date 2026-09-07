import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import RecipeRestrictionModal from '../RecipeRestrictionModal.vue'

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
      :data-selected="selected"
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

function mountModal(props = {}) {
  return shallowMount(RecipeRestrictionModal, {
    props: {
      open: false,
      title: 'Seleccionar restricciones',
      restrictions,
      selectedRestrictions: [],
      ...props,
    },

    global: {
      stubs: {
        RestrictionCard: RestrictionCardStub,
      },
    },
  })
}

describe('RecipeRestrictionModal', () => {
  it('is hidden when closed', () => {
    const wrapper = mountModal()

    expect(wrapper.find('.recipe-restriction-modal-overlay').exists()).toBe(false)
  })

  it('shows the supplied title and all restrictions', async () => {
    const wrapper = mountModal({
      title: 'Receta adaptada para',
    })

    await wrapper.setProps({
      open: true,
    })

    expect(wrapper.text()).toContain('Receta adaptada para')

    const cards = wrapper.findAll('.restriction-card-stub')

    expect(cards).toHaveLength(4)

    expect(wrapper.text()).toContain('Gluten')

    expect(wrapper.text()).toContain('Lactosa')

    expect(wrapper.text()).toContain('Vegano')

    expect(wrapper.text()).toContain('Halal')
  })

  it('copies the current selection when opened', async () => {
    const wrapper = mountModal({
      selectedRestrictions: [1, 3],
    })

    await wrapper.setProps({
      open: true,
    })

    const cards = wrapper.findAll('.restriction-card-stub')

    expect(cards[0].attributes('data-selected')).toBe('true')

    expect(cards[1].attributes('data-selected')).toBe('false')

    expect(cards[2].attributes('data-selected')).toBe('true')
  })

  it('adds a restriction and confirms the new selection', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    await wrapper.findAll('.restriction-card-stub')[1].trigger('click')

    await wrapper.find('.recipe-restriction-confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([[[2]]])
  })

  it('removes an already selected restriction', async () => {
    const wrapper = mountModal({
      selectedRestrictions: [1, 3],
    })

    await wrapper.setProps({
      open: true,
    })

    await wrapper.findAll('.restriction-card-stub')[0].trigger('click')

    await wrapper.find('.recipe-restriction-confirm').trigger('click')

    expect(wrapper.emitted('confirm')).toEqual([[[3]]])
  })

  it('emits close from the close button', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    await wrapper.find('.recipe-restriction-modal-close').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close from the cancel button', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    await wrapper.find('.recipe-restriction-cancel').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the overlay is clicked', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    await wrapper.find('.recipe-restriction-modal-overlay').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
