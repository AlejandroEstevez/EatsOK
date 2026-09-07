import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

import { nextTick } from 'vue'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),

  push: vi.fn(),
  replace: vi.fn(),

  route: {
    params: {},
  },
}))

vi.mock('../../services/api', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    patch: mocks.patch,
    delete: mocks.delete,
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,

  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
}))

import EstablishmentFormView from '../EstablishmentFormView.vue'

const tags = [
  {
    id: 1,
    name: 'Italiano',
  },
  {
    id: 2,
    name: 'Familiar',
  },
]

const restrictions = [
  {
    id: 1,
    name: 'Gluten',
    type: 'allergy',
  },
  {
    id: 2,
    name: 'Vegano',
    type: 'diet',
  },
]

const existingEstablishment = {
  id: 10,

  name: 'Restaurante existente',

  description: 'Descripción existente',

  phone: '910000000',

  email: 'owner@example.com',

  opening_time: '09:30:00',

  closing_time: '22:15:00',

  cross_contamination: 'Puede existir contaminación cruzada.',

  restrictions_info: 'Información sobre restricciones.',

  active: true,

  tags: [
    {
      id: 1,
      name: 'Italiano',
    },
  ],

  image_url: 'https://example.com/restaurant.jpg',

  location: {
    address: 'Calle Mayor 1',

    city: 'Madrid',

    region: 'Madrid',

    country: 'España',

    postal_code: '28013',

    latitude: 40.4168,

    longitude: -3.7038,
  },

  dishes: [
    {
      id: 100,

      name: 'Pasta existente',

      description: 'Pasta de prueba',

      price: '12.50',

      available: true,

      image_url: 'https://example.com/pasta.jpg',

      dish_restrictions: [
        {
          restriction: 1,
          presence_type: 'traces',
        },
      ],
    },
  ],
}

function mockPageData(establishment = null) {
  mocks.get.mockImplementation((url) => {
    if (url === '/establishments/tags/') {
      return Promise.resolve({
        data: tags,
      })
    }

    if (url === '/food-profiles/restrictions/') {
      return Promise.resolve({
        data: restrictions,
      })
    }

    if (establishment && url === `/establishments/${mocks.route.params.id}/`) {
      return Promise.resolve({
        data: establishment,
      })
    }

    return Promise.reject(new Error(`Unexpected endpoint: ${url}`))
  })
}

function mountView() {
  return shallowMount(EstablishmentFormView, {
    global: {
      stubs: {
        NavBar: true,
      },
    },
  })
}

async function mountCreateView() {
  mocks.route.params = {}

  mockPageData()

  const wrapper = mountView()

  await flushPromises()

  return wrapper
}

async function mountEditView() {
  mocks.route.params = {
    id: '10',
  }

  mockPageData(existingEstablishment)

  const wrapper = mountView()

  await flushPromises()

  return wrapper
}

function findField(wrapper, labelText) {
  const labels = wrapper.findAll('label.establishment-field')

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

async function fillValidForm(wrapper) {
  await findField(wrapper, 'Nombre *').setValue('Restaurante Test')

  await findField(wrapper, 'Descripción *').setValue('Descripción del restaurante')

  await findField(wrapper, 'Dirección *').setValue('Calle Test 1')

  await findField(wrapper, 'Ciudad *').setValue('Madrid')

  await findField(wrapper, 'Provincia o región *').setValue('Madrid')

  await findField(wrapper, 'País *').setValue('España')

  await findField(wrapper, 'Código postal *').setValue('28001')
}

beforeEach(() => {
  mocks.get.mockReset()
  mocks.post.mockReset()
  mocks.patch.mockReset()
  mocks.delete.mockReset()

  mocks.push.mockReset()
  mocks.replace.mockReset()

  mocks.route.params = {}
})

describe('EstablishmentFormView', () => {
  it('loads tags and restrictions in creation mode', async () => {
    const wrapper = await mountCreateView()

    expect(mocks.get).toHaveBeenCalledTimes(2)

    expect(mocks.get).toHaveBeenCalledWith('/establishments/tags/')

    expect(mocks.get).toHaveBeenCalledWith('/food-profiles/restrictions/')

    expect(wrapper.text()).toContain('Crear establecimiento')

    expect(wrapper.findAll('.establishment-tag')).toHaveLength(2)
  })

  it('loads existing establishment data in edit mode', async () => {
    const wrapper = await mountEditView()

    expect(mocks.get).toHaveBeenCalledWith('/establishments/10/')

    expect(wrapper.text()).toContain('Editar establecimiento')

    expect(findField(wrapper, 'Nombre *').element.value).toBe('Restaurante existente')

    expect(findField(wrapper, 'Descripción *').element.value).toBe('Descripción existente')

    const times = wrapper.findAll('input[type="time"]')

    expect(times[0].element.value).toBe('09:30')

    expect(times[1].element.value).toBe('22:15')

    expect(wrapper.findAll('.dish-form-row')).toHaveLength(1)

    const dish = wrapper.find('.dish-form-row')

    expect(findField(dish, 'Nombre *').element.value).toBe('Pasta existente')

    expect(wrapper.findAll('.establishment-tag')[0].classes()).toContain(
      'establishment-tag--selected'
    )

    expect(wrapper.find('input[value="traces"]').element.checked).toBe(true)
  })

  it('shows an error when page data cannot be loaded', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mocks.get.mockRejectedValue(new Error('Server error'))

    const wrapper = mountView()

    await flushPromises()

    expect(wrapper.text()).toContain('No se han podido cargar los datos del establecimiento.')

    consoleSpy.mockRestore()
  })

  it('selects and deselects establishment tags', async () => {
    const wrapper = await mountCreateView()

    const tag = wrapper.findAll('.establishment-tag')[0]

    expect(tag.classes()).not.toContain('establishment-tag--selected')

    await tag.trigger('click')

    expect(tag.classes()).toContain('establishment-tag--selected')

    await tag.trigger('click')

    expect(tag.classes()).not.toContain('establishment-tag--selected')
  })

  it('adds and removes a new dish', async () => {
    const wrapper = await mountCreateView()

    expect(wrapper.findAll('.dish-form-row')).toHaveLength(0)

    await wrapper.find('.dish-add-button').trigger('click')

    expect(wrapper.findAll('.dish-form-row')).toHaveLength(1)

    expect(wrapper.find('.dish-available-field input').element.checked).toBe(true)

    await wrapper.find('.dish-delete-button').trigger('click')

    expect(wrapper.findAll('.dish-form-row')).toHaveLength(0)
  })

  it('requires an establishment name', async () => {
    const wrapper = await mountCreateView()

    await wrapper.find('.establishment-form').trigger('submit')

    await nextTick()

    expect(mocks.post).not.toHaveBeenCalled()

    expect(wrapper.find('.establishment-form-error').text()).toBe(
      'Introduce el nombre del establecimiento.'
    )
  })

  it('requires every added dish to have a name', async () => {
    const wrapper = await mountCreateView()

    await fillValidForm(wrapper)

    await wrapper.find('.dish-add-button').trigger('click')

    await wrapper.find('.establishment-form').trigger('submit')

    await nextTick()

    expect(mocks.post).not.toHaveBeenCalled()

    expect(wrapper.find('.establishment-form-error').text()).toBe(
      'Todos los platos añadidos deben tener un nombre.'
    )
  })

  it('creates an establishment with normalized form data', async () => {
    const wrapper = await mountCreateView()

    await fillValidForm(wrapper)

    await findField(wrapper, 'Nombre *').setValue('  Mi restaurante  ')

    await findField(wrapper, 'Teléfono').setValue(' 910000001 ')

    await findField(wrapper, 'Correo electrónico').setValue(' owner@example.com ')

    await findField(wrapper, 'Latitud').setValue('40.4168')

    await findField(wrapper, 'Longitud').setValue('-3.7038')

    mocks.post.mockResolvedValueOnce({
      data: {
        id: 55,
      },
    })

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(mocks.post).toHaveBeenCalledWith(
      '/establishments/',
      expect.objectContaining({
        name: 'Mi restaurante',

        phone: '910000001',

        email: 'owner@example.com',

        opening_time: null,

        closing_time: null,

        location: expect.objectContaining({
          address: 'Calle Test 1',

          city: 'Madrid',

          region: 'Madrid',

          country: 'España',

          postal_code: '28001',

          latitude: 40.4168,

          longitude: -3.7038,
        }),
      })
    )

    expect(mocks.push).toHaveBeenCalledWith('/establishments/55')
  })

  it('serializes allergy and diet restrictions when creating a dish', async () => {
    const wrapper = await mountCreateView()

    await fillValidForm(wrapper)

    await wrapper.find('.dish-add-button').trigger('click')

    const dish = wrapper.find('.dish-form-row')

    await findField(dish, 'Nombre *').setValue('Pizza especial')

    await findField(dish, 'Precio').setValue('12.50')

    await dish.find('input[value="contains"]').trigger('change')

    await dish.find('input[value="not_suitable"]').trigger('change')

    mocks.post
      .mockResolvedValueOnce({
        data: {
          id: 55,
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 101,
        },
      })

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(mocks.post).toHaveBeenNthCalledWith(
      2,
      '/establishments/55/dishes/',
      expect.objectContaining({
        name: 'Pizza especial',

        price: 12.5,

        available: true,

        dish_restrictions: [
          {
            restriction: 1,
            presence_type: 'contains',
          },
          {
            restriction: 2,
            presence_type: 'contains',
          },
        ],
      })
    )
  })

  it('updates an establishment and its existing dishes', async () => {
    const wrapper = await mountEditView()

    mocks.patch.mockResolvedValue({
      data: {},
    })

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledTimes(2)

    expect(mocks.patch).toHaveBeenNthCalledWith(
      1,
      '/establishments/10/',
      expect.objectContaining({
        name: 'Restaurante existente',
      })
    )

    expect(mocks.patch).toHaveBeenNthCalledWith(
      2,
      '/establishments/10/dishes/100/',
      expect.objectContaining({
        name: 'Pasta existente',

        dish_restrictions: [
          {
            restriction: 1,
            presence_type: 'traces',
          },
        ],
      })
    )

    expect(mocks.push).toHaveBeenCalledWith('/establishments/10')
  })

  it('deletes removed existing dishes when saving', async () => {
    const wrapper = await mountEditView()

    mocks.patch.mockResolvedValue({
      data: {},
    })

    mocks.delete.mockResolvedValue({
      data: {},
    })

    await wrapper.find('.dish-delete-button').trigger('click')

    expect(wrapper.findAll('.dish-form-row')).toHaveLength(0)

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(mocks.delete).toHaveBeenCalledWith('/establishments/10/dishes/100/')

    expect(mocks.patch).toHaveBeenCalledTimes(1)
  })

  it('keeps the new establishment in edit mode if saving a dish fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountCreateView()

    await fillValidForm(wrapper)

    await wrapper.find('.dish-add-button').trigger('click')

    const dish = wrapper.find('.dish-form-row')

    await findField(dish, 'Nombre *').setValue('Plato Test')

    mocks.post
      .mockResolvedValueOnce({
        data: {
          id: 77,
        },
      })
      .mockRejectedValueOnce(new Error('Dish error'))

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(mocks.replace).toHaveBeenCalledWith('/owner/establishments/77/edit')

    expect(wrapper.find('.establishment-form-error').text()).toBe(
      'El establecimiento se ha creado, pero no se han podido guardar todos los platos. Revisa los datos y vuelve a guardar.'
    )

    expect(mocks.push).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('shows the API detail when editing fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = await mountEditView()

    mocks.patch.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'No tienes permisos para editar este establecimiento.',
        },
      },
    })

    await wrapper.find('.establishment-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.establishment-form-error').text()).toBe(
      'No tienes permisos para editar este establecimiento.'
    )

    consoleSpy.mockRestore()
  })

  it('returns to owner establishments when cancelled', async () => {
    const wrapper = await mountCreateView()

    await wrapper.find('.establishment-cancel-button').trigger('click')

    expect(mocks.push).toHaveBeenCalledWith('/owner/establishments')
  })

  it('shows saving state while the establishment is being created', async () => {
    let resolvePost

    const wrapper = await mountCreateView()

    await fillValidForm(wrapper)

    mocks.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve
        })
    )

    await wrapper.find('.establishment-form').trigger('submit')

    await nextTick()

    const saveButton = wrapper.find('.establishment-save-button')

    expect(saveButton.text()).toBe('Guardando...')

    expect(saveButton.attributes('disabled')).toBeDefined()

    resolvePost({
      data: {
        id: 55,
      },
    })

    await flushPromises()

    expect(saveButton.text()).toBe('Crear establecimiento')

    expect(saveButton.attributes('disabled')).toBeUndefined()
  })
})
