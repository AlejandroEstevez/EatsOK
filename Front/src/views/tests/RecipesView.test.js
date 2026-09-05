import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  flushPromises,
  shallowMount,
} from '@vue/test-utils'

import {
  nextTick,
} from 'vue'


const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),

  authStore: {
    user: {
      id: 7,
      username: 'alex',
      role: 'CLIENT',
    },
  },
}))


vi.mock('../../services/api.js', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    patch: mocks.patch,
    delete: mocks.delete,
  },
}))


vi.mock('../../stores/auth.js', () => ({
  useAuthStore: () =>
    mocks.authStore,
}))


import RecipesView
  from '../RecipesView.vue'


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


const recipes = [
  {
    id: 10,
    title: 'Pasta adaptada',
    description:
      'Receta de prueba',
    preparation_time: 30,
    author: 'alex',
    author_id: 7,
    average_rating: 4.5,
    review_count: 4,
  },

  {
    id: 20,
    title: 'Tarta sencilla',
    description:
      'Otra receta',
    preparation_time: 50,
    author: 'maria',
    author_id: 9,
    average_rating: 4,
    review_count: 2,
  },
]


const recipeDetail = {
  id: 10,
  title: 'Pasta adaptada',
  description:
    'Detalle completo',
  preparation_time: 30,
  author: 'alex',
  author_id: 7,
  ingredients:
    'Pasta\nTomate',
  steps:
    'Cocer\nServir',
  adapted_restrictions: [
    {
      id: 1,
      name: 'Gluten',
      type: 'allergy',
    },
  ],
}


const RecipeFiltersStub = {
  name: 'RecipeFiltersStub',

  props: {
    search: String,
    useProfile: Boolean,
    restrictions: Array,
    selectedRestrictions: Array,
  },

  emits: [
    'update:search',
    'update:use-profile',
    'toggle-restriction',
    'replace-restrictions',
    'clear',
  ],

  template: `
    <div class="recipe-filters-stub"></div>
  `,
}


const RecipeCardStub = {
  name: 'RecipeCardStub',

  props: {
    recipe: Object,
  },

  emits: [
    'select',
  ],

  template: `
    <article
      class="recipe-card-stub"
      @click="$emit('select', recipe)"
    >
      {{ recipe.title }}
    </article>
  `,
}


const RecipeDetailPanelStub = {
  name: 'RecipeDetailPanelStub',

  props: {
    recipe: Object,
    loading: Boolean,
    error: String,
    canManage: Boolean,
    deleting: Boolean,
  },

  emits: [
    'close',
    'edit',
    'delete',
  ],

  template: `
    <div class="recipe-detail-panel-stub"></div>
  `,
}


const RecipeFormPanelStub = {
  name: 'RecipeFormPanelStub',

  props: {
    open: Boolean,
    mode: String,
    recipe: Object,
    restrictions: Array,
    saving: Boolean,
    error: String,
  },

  emits: [
    'close',
    'submit',
  ],

  template: `
    <div class="recipe-form-panel-stub"></div>
  `,
}


let wrappers = []


function mockApi({
  profileEnabled = true,
  profileRestrictions = [],
  searchResults = recipes,
  searchError = null,
  detailData = recipeDetail,
  detailError = null,
} = {}) {
  mocks.get.mockImplementation(
    url => {
      if (
        url
        === '/food-profiles/restrictions/'
      ) {
        return Promise.resolve({
          data: restrictions,
        })
      }

      if (
        url
        === '/food-profiles/'
      ) {
        return Promise.resolve({
          data: {
            enabled:
              profileEnabled,

            restrictions:
              profileRestrictions,
          },
        })
      }

      if (
        url
        === '/search/recipes/'
      ) {
        if (searchError) {
          return Promise.reject(
            searchError
          )
        }

        return Promise.resolve({
          data: searchResults,
        })
      }

      if (
        /^\/recipes\/\d+\/$/.test(
          url
        )
      ) {
        if (detailError) {
          return Promise.reject(
            detailError
          )
        }

        return Promise.resolve({
          data: detailData,
        })
      }

      return Promise.reject(
        new Error(
          `Unexpected endpoint: ${url}`
        )
      )
    }
  )
}


function mountView() {
  const wrapper =
    shallowMount(
      RecipesView,
      {
        global: {
          stubs: {
            NavBar: true,

            RecipeFilters:
              RecipeFiltersStub,

            RecipeCard:
              RecipeCardStub,

            RecipeDetailPanel:
              RecipeDetailPanelStub,

            RecipeFormPanel:
              RecipeFormPanelStub,
          },
        },
      }
    )

  wrappers.push(wrapper)

  return wrapper
}


async function mountLoadedView(
  options = {}
) {
  mockApi(options)

  const wrapper =
    mountView()

  await flushPromises()

  return wrapper
}


function getFilters(
  wrapper
) {
  return wrapper.findComponent({
    name:
      'RecipeFiltersStub',
  })
}


function getDetail(
  wrapper
) {
  return wrapper.findComponent({
    name:
      'RecipeDetailPanelStub',
  })
}


function getForm(
  wrapper
) {
  return wrapper.findComponent({
    name:
      'RecipeFormPanelStub',
  })
}


function getSearchCalls() {
  return mocks.get.mock.calls
    .filter(
      ([url]) =>
        url
        === '/search/recipes/'
    )
}


function getLastSearchParams() {
  const calls =
    getSearchCalls()

  return calls[
    calls.length - 1
  ][1].params
}


beforeEach(() => {
  mocks.get.mockReset()
  mocks.post.mockReset()
  mocks.patch.mockReset()
  mocks.delete.mockReset()

  mocks.post.mockResolvedValue({
    data: {},
  })

  mocks.patch.mockResolvedValue({
    data: {},
  })

  mocks.delete.mockResolvedValue({
    data: {},
  })

  mocks.authStore.user = {
    id: 7,
    username: 'alex',
    role: 'CLIENT',
  }
})


afterEach(() => {
  wrappers.forEach(
    wrapper =>
      wrapper.unmount()
  )

  wrappers = []

  vi.useRealTimers()
})


describe(
  'RecipesView',
  () => {
    it(
      'loads restrictions, profile and recipes on mount',
      async () => {
        const wrapper =
          await mountLoadedView({
            profileEnabled: true,

            profileRestrictions: [
              {
                id: 1,
              },
              3,
            ],
          })

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/food-profiles/restrictions/'
        )

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/food-profiles/'
        )

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/search/recipes/',
          {
            params: {
              search: '',
              use_profile: true,
              ordering:
                '-publication_date',
            },
          }
        )

        const filters =
          getFilters(wrapper)

        expect(
          filters.props(
            'selectedRestrictions'
          )
        ).toEqual([
          1,
          3,
        ])

        expect(
          filters.props(
            'useProfile'
          )
        ).toBe(true)
      }
    )


    it(
      'renders the recipe count and cards',
      async () => {
        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.text()
        ).toContain(
          '2 recetas encontradas'
        )

        expect(
          wrapper.findAllComponents({
            name:
              'RecipeCardStub',
          })
        ).toHaveLength(2)

        expect(
          wrapper.text()
        ).toContain(
          'Pasta adaptada'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Tarta sencilla'
        )
      }
    )


    it(
      'shows an error when recipes cannot be loaded',
      async () => {
        const consoleSpy =
          vi.spyOn(
            console,
            'error'
          )
          .mockImplementation(
            () => {}
          )

        const wrapper =
          await mountLoadedView({
            searchError:
              new Error(
                'Search error'
              ),
          })

        expect(
          wrapper.text()
        ).toContain(
          'No se han podido cargar las recetas.'
        )

        expect(
          wrapper.findAllComponents({
            name:
              'RecipeCardStub',
          })
        ).toHaveLength(0)

        consoleSpy.mockRestore()
      }
    )


    it(
      'searches recipes after the search debounce',
      async () => {
        vi.useFakeTimers()

        const wrapper =
          await mountLoadedView()

        const filters =
          getFilters(wrapper)

        filters.vm.$emit(
          'update:search',
          'pasta'
        )

        await nextTick()

        expect(
          getSearchCalls()
        ).toHaveLength(1)

        await vi.advanceTimersByTimeAsync(
          250
        )

        await flushPromises()

        expect(
          getSearchCalls()
        ).toHaveLength(2)

        expect(
          getLastSearchParams()
            .search
        ).toBe(
          'pasta'
        )
      }
    )


    it(
      'searches again when ordering changes',
      async () => {
        vi.useFakeTimers()

        const wrapper =
          await mountLoadedView()

        await wrapper
          .find(
            '.recipes-ordering'
          )
          .setValue(
            '-rating'
          )

        await vi.advanceTimersByTimeAsync(
          250
        )

        await flushPromises()

        expect(
          getLastSearchParams()
            .ordering
        ).toBe(
          '-rating'
        )
      }
    )


    it(
      'disables profile filtering when a restriction is toggled',
      async () => {
        const wrapper =
          await mountLoadedView({
            profileRestrictions: [
              1,
            ],
          })

        const filters =
          getFilters(wrapper)

        filters.vm.$emit(
          'toggle-restriction',
          2
        )

        await nextTick()

        expect(
          filters.props(
            'useProfile'
          )
        ).toBe(false)

        expect(
          filters.props(
            'selectedRestrictions'
          )
        ).toEqual([
          1,
          2,
        ])
      }
    )


    it(
      'adds profile restrictions when profile filtering is enabled',
      async () => {
        const wrapper =
          await mountLoadedView({
            profileEnabled: false,

            profileRestrictions: [
              1,
              3,
            ],
          })

        const filters =
          getFilters(wrapper)

        filters.vm.$emit(
          'toggle-restriction',
          2
        )

        await nextTick()

        filters.vm.$emit(
          'update:use-profile',
          true
        )

        await nextTick()

        expect(
          filters.props(
            'useProfile'
          )
        ).toBe(true)

        expect(
          filters.props(
            'selectedRestrictions'
          )
        ).toEqual([
          2,
          1,
          3,
        ])
      }
    )


    it(
      'replaces restrictions of one type while preserving the other type',
      async () => {
        const wrapper =
          await mountLoadedView({
            profileEnabled: false,
          })

        const filters =
          getFilters(wrapper)

        filters.vm.$emit(
          'toggle-restriction',
          1
        )

        await nextTick()

        filters.vm.$emit(
          'toggle-restriction',
          3
        )

        await nextTick()

        filters.vm.$emit(
          'replace-restrictions',
          {
            type: 'allergy',
            selection: [
              2,
            ],
          }
        )

        await nextTick()

        expect(
          filters.props(
            'selectedRestrictions'
          )
        ).toEqual([
          3,
          2,
        ])

        expect(
          filters.props(
            'useProfile'
          )
        ).toBe(false)
      }
    )


    it(
      'clears recipe filters',
      async () => {
        const wrapper =
          await mountLoadedView()

        const filters =
          getFilters(wrapper)

        filters.vm.$emit(
          'update:search',
          'pizza'
        )

        filters.vm.$emit(
          'toggle-restriction',
          2
        )

        await wrapper
          .find(
            '.recipes-ordering'
          )
          .setValue(
            '-rating'
          )

        await nextTick()

        filters.vm.$emit(
          'clear'
        )

        await nextTick()

        expect(
          filters.props(
            'search'
          )
        ).toBe('')

        expect(
          filters.props(
            'useProfile'
          )
        ).toBe(false)

        expect(
          filters.props(
            'selectedRestrictions'
          )
        ).toEqual([])

        expect(
          wrapper
            .find(
              '.recipes-ordering'
            )
            .element.value
        ).toBe(
          '-publication_date'
        )
      }
    )


    it(
      'loads complete recipe detail when a recipe is selected',
      async () => {
        const wrapper =
          await mountLoadedView()

        const card =
          wrapper.findAllComponents({
            name:
              'RecipeCardStub',
          })[0]

        card.vm.$emit(
          'select',
          recipes[0]
        )

        await flushPromises()

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/recipes/10/'
        )

        expect(
          getDetail(
            wrapper
          ).props('recipe')
        ).toEqual(
          expect.objectContaining({
            id: 10,
            title:
              'Pasta adaptada',
            description:
              'Detalle completo',
            ingredients:
              'Pasta\nTomate',
          })
        )

        expect(
          getDetail(
            wrapper
          ).props('loading')
        ).toBe(false)
      }
    )


    it(
      'shows an error when recipe detail cannot be loaded',
      async () => {
        const consoleSpy =
          vi.spyOn(
            console,
            'error'
          )
          .mockImplementation(
            () => {}
          )

        const wrapper =
          await mountLoadedView({
            detailError:
              new Error(
                'Detail error'
              ),
          })

        const card =
          wrapper.findAllComponents({
            name:
              'RecipeCardStub',
          })[0]

        card.vm.$emit(
          'select',
          recipes[0]
        )

        await flushPromises()

        expect(
          getDetail(
            wrapper
          ).props('error')
        ).toBe(
          'No se ha podido cargar el detalle de la receta.'
        )

        consoleSpy.mockRestore()
      }
    )


    it(
      'allows the recipe author to manage the selected recipe',
      async () => {
        mocks.authStore.user = {
          id: 7,
          username: 'alex',
          role: 'CLIENT',
        }

        const wrapper =
          await mountLoadedView()

        wrapper
          .findAllComponents({
            name:
              'RecipeCardStub',
          })[0]
          .vm.$emit(
            'select',
            recipes[0]
          )

        await flushPromises()

        expect(
          getDetail(
            wrapper
          ).props(
            'canManage'
          )
        ).toBe(true)
      }
    )


    it(
      'does not allow another user to manage the selected recipe',
      async () => {
        mocks.authStore.user = {
          id: 99,
          username: 'other',
          role: 'CLIENT',
        }

        const wrapper =
          await mountLoadedView()

        wrapper
          .findAllComponents({
            name:
              'RecipeCardStub',
          })[0]
          .vm.$emit(
            'select',
            recipes[0]
          )

        await flushPromises()

        expect(
          getDetail(
            wrapper
          ).props(
            'canManage'
          )
        ).toBe(false)
      }
    )


    it(
      'opens the recipe form in creation mode',
      async () => {
        const wrapper =
          await mountLoadedView()

        await wrapper
          .find(
            '.recipes-create-button'
          )
          .trigger('click')

        const form =
          getForm(wrapper)

        expect(
          form.props('open')
        ).toBe(true)

        expect(
          form.props('mode')
        ).toBe(
          'create'
        )

        expect(
          form.props('recipe')
        ).toBeNull()
      }
    )


    it(
      'opens the recipe form in edit mode',
      async () => {
        const wrapper =
          await mountLoadedView()

        const recipe =
          {
            ...recipeDetail,
          }

        getDetail(
          wrapper
        ).vm.$emit(
          'edit',
          recipe
        )

        await nextTick()

        const form =
          getForm(wrapper)

        expect(
          form.props('open')
        ).toBe(true)

        expect(
          form.props('mode')
        ).toBe(
          'edit'
        )

        expect(
          form.props('recipe')
        ).toEqual(
          recipe
        )
      }
    )


    it(
      'creates a recipe and refreshes the results',
      async () => {
        const wrapper =
          await mountLoadedView()

        await wrapper
          .find(
            '.recipes-create-button'
          )
          .trigger('click')

        const payload = {
          title:
            'Nueva receta',

          description:
            'Descripción',

          preparation_time:
            25,

          image_url: '',

          ingredients:
            'Ingrediente',

          steps:
            'Paso',

          recipe_restrictions: [],
        }

        getForm(
          wrapper
        ).vm.$emit(
          'submit',
          payload
        )

        await flushPromises()

        expect(
          mocks.post
        ).toHaveBeenCalledWith(
          '/recipes/',
          payload
        )

        expect(
          getForm(
            wrapper
          ).props('open')
        ).toBe(false)

        expect(
          getSearchCalls()
            .length
        ).toBeGreaterThanOrEqual(
          2
        )
      }
    )


    it(
      'updates an existing recipe and refreshes the results',
      async () => {
        const wrapper =
          await mountLoadedView()

        const recipe = {
          ...recipeDetail,
        }

        getDetail(
          wrapper
        ).vm.$emit(
          'edit',
          recipe
        )

        await nextTick()

        const payload = {
          title:
            'Receta modificada',
          description: '',
          preparation_time: 20,
          image_url: '',
          ingredients:
            'Ingrediente',
          steps: 'Paso',
          recipe_restrictions: [],
        }

        getForm(
          wrapper
        ).vm.$emit(
          'submit',
          payload
        )

        await flushPromises()

        expect(
          mocks.patch
        ).toHaveBeenCalledWith(
          '/recipes/10/',
          payload
        )

        expect(
          getForm(
            wrapper
          ).props('open')
        ).toBe(false)
      }
    )


    it(
      'shows API errors when a recipe cannot be saved',
      async () => {
        const consoleSpy =
          vi.spyOn(
            console,
            'error'
          )
          .mockImplementation(
            () => {}
          )

        mocks.post
          .mockRejectedValueOnce({
            response: {
              data: {
                title: [
                  'El título no es válido.',
                ],
              },
            },
          })

        const wrapper =
          await mountLoadedView()

        await wrapper
          .find(
            '.recipes-create-button'
          )
          .trigger('click')

        getForm(
          wrapper
        ).vm.$emit(
          'submit',
          {
            title: '',
          }
        )

        await flushPromises()

        expect(
          getForm(
            wrapper
          ).props('error')
        ).toBe(
          'El título no es válido.'
        )

        expect(
          getForm(
            wrapper
          ).props('open')
        ).toBe(true)

        consoleSpy.mockRestore()
      }
    )


    it(
      'does not delete a recipe when confirmation is cancelled',
      async () => {
        const confirmSpy =
          vi.spyOn(
            window,
            'confirm'
          )
          .mockReturnValue(
            false
          )

        const wrapper =
          await mountLoadedView()

        getDetail(
          wrapper
        ).vm.$emit(
          'delete',
          recipes[0]
        )

        await flushPromises()

        expect(
          mocks.delete
        ).not.toHaveBeenCalled()

        confirmSpy.mockRestore()
      }
    )


    it(
      'deletes a confirmed recipe and refreshes the results',
      async () => {
        const confirmSpy =
          vi.spyOn(
            window,
            'confirm'
          )
          .mockReturnValue(
            true
          )

        const wrapper =
          await mountLoadedView()

        wrapper
          .findAllComponents({
            name:
              'RecipeCardStub',
          })[0]
          .vm.$emit(
            'select',
            recipes[0]
          )

        await flushPromises()

        getDetail(
          wrapper
        ).vm.$emit(
          'delete',
          recipes[0]
        )

        await flushPromises()

        expect(
          mocks.delete
        ).toHaveBeenCalledWith(
          '/recipes/10/'
        )

        expect(
          getDetail(
            wrapper
          ).props('recipe')
        ).toBeNull()

        expect(
          getSearchCalls()
            .length
        ).toBeGreaterThanOrEqual(
          2
        )

        confirmSpy.mockRestore()
      }
    )


    it(
      'shows an API error when deletion fails',
      async () => {
        const consoleSpy =
          vi.spyOn(
            console,
            'error'
          )
          .mockImplementation(
            () => {}
          )

        const confirmSpy =
          vi.spyOn(
            window,
            'confirm'
          )
          .mockReturnValue(
            true
          )

        mocks.delete
          .mockRejectedValueOnce({
            response: {
              data: {
                detail:
                  'No puedes eliminar esta receta.',
              },
            },
          })

        const wrapper =
          await mountLoadedView()

        wrapper
          .findAllComponents({
            name:
              'RecipeCardStub',
          })[0]
          .vm.$emit(
            'select',
            recipes[0]
          )

        await flushPromises()

        getDetail(
          wrapper
        ).vm.$emit(
          'delete',
          recipes[0]
        )

        await flushPromises()

        expect(
          getDetail(
            wrapper
          ).props('error')
        ).toBe(
          'No puedes eliminar esta receta.'
        )

        expect(
          getDetail(
            wrapper
          ).props('recipe')
        ).not.toBeNull()

        confirmSpy.mockRestore()
        consoleSpy.mockRestore()
      }
    )
  }
)
