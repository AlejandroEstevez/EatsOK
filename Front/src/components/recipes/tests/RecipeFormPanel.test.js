import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import { nextTick } from 'vue'

import RecipeFormPanel from '../RecipeFormPanel.vue'

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

const existingRecipe = {
  id: 10,
  title: 'Receta existente',

  description: 'Descripción existente',

  preparation_time: 35,

  image_url: 'https://example.com/recipe.jpg',

  ingredients: 'Harina\\nHuevos\\nLeche',

  steps: '1. Mezclar\\n2. Hornear',

  recipe_restrictions: [
    {
      restriction: 1,
      relation_type: 'adapted_for',
    },
    {
      restriction: 3,
      relation_type: 'blocks',
    },
  ],
}

const RecipeRestrictionModalStub = {
  name: 'RecipeRestrictionModalStub',

  props: {
    open: Boolean,
    title: String,
    restrictions: Array,
    selectedRestrictions: Array,
  },

  emits: ['close', 'confirm'],

  template: `
    <div
      class="restriction-modal-stub"
      :data-open="open"
      :data-title="title"
    ></div>
  `,
}

function mountPanel(props = {}) {
  return shallowMount(RecipeFormPanel, {
    props: {
      open: false,
      mode: 'create',
      recipe: null,
      restrictions,
      saving: false,
      error: '',
      ...props,
    },

    global: {
      stubs: {
        RecipeRestrictionModal: RecipeRestrictionModalStub,
      },
    },
  })
}

async function openPanel(props = {}) {
  const wrapper = mountPanel(props)

  await wrapper.setProps({
    open: true,
  })

  await nextTick()

  return wrapper
}

function findField(wrapper, labelText) {
  const labels = wrapper.findAll('label.recipe-form-field')

  const label = labels.find((item) => {
    const span = item.find('span')

    return span.exists() && span.text().trim() === labelText
  })

  if (!label) {
    throw new Error(`Field not found: ${labelText}`)
  }

  const input = label.find('input')

  if (input.exists()) {
    return input
  }

  return label.find('textarea')
}

function getModal(wrapper) {
  return wrapper.findComponent({
    name: 'RecipeRestrictionModalStub',
  })
}

describe('RecipeFormPanel', () => {
  it('is hidden when closed', () => {
    const wrapper = mountPanel()

    expect(wrapper.find('.recipe-form-overlay').exists()).toBe(false)
  })

  it('opens in creation mode with empty fields', async () => {
    const wrapper = await openPanel()

    expect(wrapper.text()).toContain('Crear receta')

    expect(findField(wrapper, 'Título *').element.value).toBe('')

    expect(findField(wrapper, 'Ingredientes *').element.value).toBe('')

    expect(findField(wrapper, 'Pasos de elaboración *').element.value).toBe('')

    expect(wrapper.findAll('.recipe-form-empty')).toHaveLength(2)
  })

  it('loads recipe data in edit mode', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    expect(wrapper.text()).toContain('Editar receta')

    expect(findField(wrapper, 'Título *').element.value).toBe('Receta existente')

    expect(findField(wrapper, 'Descripción').element.value).toBe('Descripción existente')

    expect(findField(wrapper, 'Tiempo de preparación').element.value).toBe('35')

    expect(findField(wrapper, 'URL de la imagen').element.value).toBe(
      'https://example.com/recipe.jpg'
    )
  })

  it('normalizes multiline ingredients and steps when editing', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    expect(findField(wrapper, 'Ingredientes *').element.value).toBe('Harina\nHuevos\nLeche')

    expect(findField(wrapper, 'Pasos de elaboración *').element.value).toBe(
      '1. Mezclar\n2. Hornear'
    )
  })

  it('loads adapted and blocked restrictions when editing', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    const adapted = wrapper.findAll('.recipe-form-badge--adapted')

    const blocked = wrapper.findAll('.recipe-form-badge--blocked')

    expect(adapted).toHaveLength(1)

    expect(adapted[0].text()).toContain('Sin gluten')

    expect(blocked).toHaveLength(1)

    expect(blocked[0].text()).toContain('Vegano')
  })

  it('opens the adapted restrictions modal', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    await wrapper.findAll('.recipe-form-section-heading button')[0].trigger('click')

    const modal = getModal(wrapper)

    expect(modal.props('open')).toBe(true)

    expect(modal.props('title')).toBe('Receta adaptada para')

    expect(modal.props('selectedRestrictions')).toEqual([1])
  })

  it('opens the blocked restrictions modal', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    await wrapper.findAll('.recipe-form-section-heading button')[1].trigger('click')

    const modal = getModal(wrapper)

    expect(modal.props('open')).toBe(true)

    expect(modal.props('title')).toBe('Restricciones bloqueantes')

    expect(modal.props('selectedRestrictions')).toEqual([3])
  })

  it('sets adapted restrictions and removes overlaps from blocked restrictions', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    await wrapper.findAll('.recipe-form-section-heading button')[0].trigger('click')

    getModal(wrapper).vm.$emit('confirm', [1, 3])

    await nextTick()

    const adapted = wrapper.findAll('.recipe-form-badge--adapted')

    expect(adapted).toHaveLength(2)

    expect(wrapper.findAll('.recipe-form-badge--blocked')).toHaveLength(0)

    expect(getModal(wrapper).props('open')).toBe(false)
  })

  it('sets blocked restrictions and removes overlaps from adapted restrictions', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    await wrapper.findAll('.recipe-form-section-heading button')[1].trigger('click')

    getModal(wrapper).vm.$emit('confirm', [1, 3])

    await nextTick()

    expect(wrapper.findAll('.recipe-form-badge--adapted')).toHaveLength(0)

    const blocked = wrapper.findAll('.recipe-form-badge--blocked')

    expect(blocked).toHaveLength(2)

    expect(getModal(wrapper).props('open')).toBe(false)
  })

  it('removes an adapted restriction', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    expect(wrapper.findAll('.recipe-form-badge--adapted')).toHaveLength(1)

    await wrapper.find('.recipe-form-badge--adapted button').trigger('click')

    expect(wrapper.findAll('.recipe-form-badge--adapted')).toHaveLength(0)
  })

  it('removes a blocked restriction', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    expect(wrapper.findAll('.recipe-form-badge--blocked')).toHaveLength(1)

    await wrapper.find('.recipe-form-badge--blocked button').trigger('click')

    expect(wrapper.findAll('.recipe-form-badge--blocked')).toHaveLength(0)
  })

  it('closes the restriction modal', async () => {
    const wrapper = await openPanel()

    await wrapper.findAll('.recipe-form-section-heading button')[0].trigger('click')

    expect(getModal(wrapper).props('open')).toBe(true)

    getModal(wrapper).vm.$emit('close')

    await nextTick()

    expect(getModal(wrapper).props('open')).toBe(false)
  })

  it('emits a normalized recipe payload', async () => {
    const wrapper = await openPanel()

    await findField(wrapper, 'Título *').setValue('  Pasta especial  ')

    await findField(wrapper, 'Descripción').setValue('  Receta sencilla  ')

    await findField(wrapper, 'Tiempo de preparación').setValue('30')

    await findField(wrapper, 'URL de la imagen').setValue('https://example.com/pasta.jpg')

    await findField(wrapper, 'Ingredientes *').setValue('  Harina\nHuevos  ')

    await findField(wrapper, 'Pasos de elaboración *').setValue('  Mezclar\nHornear  ')

    await wrapper.findAll('.recipe-form-section-heading button')[0].trigger('click')

    getModal(wrapper).vm.$emit('confirm', [1, 4])

    await nextTick()

    await wrapper.findAll('.recipe-form-section-heading button')[1].trigger('click')

    getModal(wrapper).vm.$emit('confirm', [2])

    await nextTick()

    await wrapper.find('.recipe-form-scroll').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          title: 'Pasta especial',

          description: 'Receta sencilla',

          preparation_time: 30,

          image_url: 'https://example.com/pasta.jpg',

          ingredients: 'Harina\nHuevos',

          steps: 'Mezclar\nHornear',

          recipe_restrictions: [
            {
              restriction: 1,
              relation_type: 'adapted_for',
            },
            {
              restriction: 4,
              relation_type: 'adapted_for',
            },
            {
              restriction: 2,
              relation_type: 'blocks',
            },
          ],
        },
      ],
    ])
  })

  it('uses null when preparation time is empty', async () => {
    const wrapper = await openPanel()

    await findField(wrapper, 'Título *').setValue('Receta Test')

    await findField(wrapper, 'Ingredientes *').setValue('Ingrediente')

    await findField(wrapper, 'Pasos de elaboración *').setValue('Paso')

    await wrapper.find('.recipe-form-scroll').trigger('submit')

    const payload = wrapper.emitted('submit')[0][0]

    expect(payload.preparation_time).toBeNull()
  })

  it('shows the saving state and disables submit', async () => {
    const wrapper = await openPanel({
      saving: true,
    })

    const button = wrapper.find('.recipe-form-submit')

    expect(button.text()).toBe('Guardando...')

    expect(button.attributes('disabled')).toBeDefined()
  })

  it('shows edit submit text in edit mode', async () => {
    const wrapper = await openPanel({
      mode: 'edit',
      recipe: existingRecipe,
    })

    expect(wrapper.find('.recipe-form-submit').text()).toBe('Guardar cambios')
  })

  it('shows the supplied error', async () => {
    const wrapper = await openPanel({
      error: 'No se ha podido guardar la receta.',
    })

    expect(wrapper.find('.recipe-form-error').text()).toBe('No se ha podido guardar la receta.')
  })

  it('emits close from the back button', async () => {
    const wrapper = await openPanel()

    await wrapper.find('.recipe-form-back').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the overlay is clicked', async () => {
    const wrapper = await openPanel()

    await wrapper.find('.recipe-form-overlay').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
