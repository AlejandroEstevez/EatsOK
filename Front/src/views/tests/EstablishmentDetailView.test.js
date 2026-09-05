import {
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
  push: vi.fn(),

  route: {
    params: {
      id: '10',
    },
  },

  authStore: {
    user: null,
  },
}))


vi.mock('../../services/api', () => ({
  default: {
    get: mocks.get,
  },
}))


vi.mock('../../stores/auth', () => ({
  useAuthStore: () =>
    mocks.authStore,
}))


vi.mock('vue-router', () => ({
  useRoute: () =>
    mocks.route,

  useRouter: () => ({
    push: mocks.push,
  }),
}))


import EstablishmentDetailView
  from '../EstablishmentDetailView.vue'


const baseEstablishment = {
  id: 10,
  name: 'Restaurante Test',
  owner: 'owner-user',

  image_url:
    'https://example.com/restaurant.jpg',

  description:
    'Restaurante especializado en comida mediterránea.',

  restrictions_info:
    'Disponemos de opciones adaptadas.',

  compatible_percentage: 85,

  cross_contamination:
    'La cocina comparte algunas superficies.',

  opening_time: '09:30:00',
  closing_time: '22:15:00',

  phone: '910000000',
  email: 'test@example.com',

  location: {
    address: 'Calle Mayor 1',
    postal_code: '28013',
    city: 'Madrid',
  },

  tag_details: [
    {
      id: 1,
      name: 'Mediterráneo',
    },
    {
      id: 2,
      name: 'Familiar',
    },
  ],

  dishes: [
    {
      id: 1,
      name: 'Ensalada segura',
      description:
        'Ensalada preparada sin alérgenos conflictivos.',
      price: '10.50',
      image_url:
        'https://example.com/salad.jpg',
      available: true,
      is_compatible: true,
      conflicting_restrictions: [],
    },

    {
      id: 2,
      name: 'Pizza con gluten',
      description:
        'Pizza tradicional.',
      price: '12.00',
      image_url: '',
      available: true,
      is_compatible: false,

      conflicting_restrictions: [
        {
          id: 1,
          name: 'Gluten',
        },
      ],
    },

    {
      id: 3,
      name: 'Plato no disponible',
      description:
        'No debería mostrarse.',
      price: '9.00',
      image_url: '',
      available: false,
      is_compatible: true,
      conflicting_restrictions: [],
    },
  ],
}


const ReviewSectionStub = {
  name: 'ReviewSectionStub',

  props: {
    targetType: String,
    targetId: Number,
  },

  template: `
    <section
      class="review-section-stub"
      :data-target-type="targetType"
      :data-target-id="targetId"
    ></section>
  `,
}


function makeEstablishment(
  overrides = {}
) {
  return {
    ...baseEstablishment,
    ...overrides,
  }
}


function mountView() {
  return shallowMount(
    EstablishmentDetailView,
    {
      global: {
        stubs: {
          NavBar: true,

          ReviewSection:
            ReviewSectionStub,
        },
      },
    }
  )
}


async function mountLoadedView(
  overrides = {}
) {
  mocks.get.mockResolvedValueOnce({
    data:
      makeEstablishment(
        overrides
      ),
  })

  const wrapper =
    mountView()

  await flushPromises()

  return wrapper
}


beforeEach(() => {
  mocks.get.mockReset()
  mocks.push.mockReset()

  mocks.route.params.id = '10'

  mocks.authStore.user = {
    username: 'client-user',
    role: 'CLIENT',
  }
})


describe(
  'EstablishmentDetailView',
  () => {
    it(
      'loads the establishment using the route id',
      async () => {
        const wrapper =
          await mountLoadedView()

        expect(
          mocks.get
        ).toHaveBeenCalledTimes(1)

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/establishments/10/'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Restaurante Test'
        )
      }
    )


    it(
      'shows the loading state while the establishment is loading',
      async () => {
        let resolveRequest

        mocks.get.mockImplementationOnce(
          () => new Promise(resolve => {
            resolveRequest = resolve
          })
        )

        const wrapper =
          mountView()

        await nextTick()

        expect(
          wrapper.text()
        ).toContain(
          'Cargando establecimiento...'
        )

        resolveRequest({
          data: baseEstablishment,
        })

        await flushPromises()

        expect(
          wrapper.text()
        ).not.toContain(
          'Cargando establecimiento...'
        )
      }
    )


    it(
      'shows an error when the establishment cannot be loaded',
      async () => {
        const consoleSpy =
          vi.spyOn(
            console,
            'error'
          )
          .mockImplementation(
            () => {}
          )

        mocks.get.mockRejectedValueOnce(
          new Error(
            'Server error'
          )
        )

        const wrapper =
          mountView()

        await flushPromises()

        expect(
          wrapper.text()
        ).toContain(
          'No se ha podido cargar el establecimiento.'
        )

        consoleSpy.mockRestore()
      }
    )


    it(
      'renders the establishment information and formats opening hours',
      async () => {
        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.text()
        ).toContain(
          'Restaurante especializado en comida mediterránea.'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Disponemos de opciones adaptadas.'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Calle Mayor 1'
        )

        expect(
          wrapper.text()
        ).toContain(
          '28013'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Madrid'
        )

        expect(
          wrapper.text()
        ).toContain(
          '09:30'
        )

        expect(
          wrapper.text()
        ).toContain(
          '22:15'
        )

        expect(
          wrapper.text()
        ).toContain(
          '910000000'
        )

        expect(
          wrapper.text()
        ).toContain(
          'test@example.com'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Mediterráneo'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Familiar'
        )
      }
    )


    it(
      'shows high compatibility',
      async () => {
        const wrapper =
          await mountLoadedView({
            compatible_percentage: 85,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-high'
        )

        expect(
          badge.text()
        ).toContain(
          'Alta'
        )

        expect(
          badge.text()
        ).toContain(
          '85%'
        )
      }
    )


    it(
      'shows medium compatibility',
      async () => {
        const wrapper =
          await mountLoadedView({
            compatible_percentage: 60,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-medium'
        )

        expect(
          badge.text()
        ).toContain(
          'Media'
        )
      }
    )


    it(
      'shows low compatibility',
      async () => {
        const wrapper =
          await mountLoadedView({
            compatible_percentage: 25,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-low'
        )

        expect(
          badge.text()
        ).toContain(
          'Baja'
        )
      }
    )


    it(
      'shows only available dishes by default',
      async () => {
        const wrapper =
          await mountLoadedView()

        const dishes =
          wrapper.findAll(
            '.dish-card'
          )

        expect(
          dishes
        ).toHaveLength(2)

        expect(
          wrapper.text()
        ).toContain(
          'Ensalada segura'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Pizza con gluten'
        )

        expect(
          wrapper.text()
        ).not.toContain(
          'Plato no disponible'
        )
      }
    )


    it(
      'shows compatibility and conflicting restrictions for dishes',
      async () => {
        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.text()
        ).toContain(
          '✓ Compatible'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Gluten'
        )

        expect(
          wrapper.find(
            '.dish-warning-icon'
          ).exists()
        ).toBe(true)
      }
    )


    it(
      'filters dishes to show only compatible ones',
      async () => {
        const wrapper =
          await mountLoadedView()

        const buttons =
          wrapper.findAll(
            '.dish-filter-button'
          )

        await buttons[0]
          .trigger('click')

        await nextTick()

        const dishes =
          wrapper.findAll(
            '.dish-card'
          )

        expect(
          dishes
        ).toHaveLength(1)

        expect(
          wrapper.text()
        ).toContain(
          'Ensalada segura'
        )

        expect(
          wrapper.text()
        ).not.toContain(
          'Pizza con gluten'
        )

        expect(
          buttons[0].classes()
        ).toContain(
          'dish-filter-button--active'
        )
      }
    )


    it(
      'shows the empty dishes message when no compatible dishes exist',
      async () => {
        const wrapper =
          await mountLoadedView({
            dishes: [
              {
                id: 1,
                name: 'No compatible',
                description: '',
                price: '10.00',
                image_url: '',
                available: true,
                is_compatible: false,

                conflicting_restrictions: [
                  {
                    id: 1,
                    name: 'Gluten',
                  },
                ],
              },
            ],
          })

        const buttons =
          wrapper.findAll(
            '.dish-filter-button'
          )

        await buttons[0]
          .trigger('click')

        await nextTick()

        expect(
          wrapper.findAll(
            '.dish-card'
          )
        ).toHaveLength(0)

        expect(
          wrapper.text()
        ).toContain(
          'No hay platos disponibles para este filtro.'
        )
      }
    )


    it(
      'shows cross contamination information when available',
      async () => {
        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.find(
            '.cross-contamination'
          ).exists()
        ).toBe(true)

        expect(
          wrapper.text()
        ).toContain(
          'La cocina comparte algunas superficies.'
        )
      }
    )


    it(
      'hides cross contamination information when it is empty',
      async () => {
        const wrapper =
          await mountLoadedView({
            cross_contamination: '',
          })

        expect(
          wrapper.find(
            '.cross-contamination'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows the edit button to the owner of the establishment',
      async () => {
        mocks.authStore.user = {
          username: 'owner-user',
          role: 'OWNER',
        }

        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.find(
            '.establishment-edit-button'
          ).exists()
        ).toBe(true)
      }
    )


    it(
      'does not show the edit button to another user',
      async () => {
        mocks.authStore.user = {
          username: 'another-owner',
          role: 'OWNER',
        }

        const wrapper =
          await mountLoadedView()

        expect(
          wrapper.find(
            '.establishment-edit-button'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'navigates to edit when the owner clicks the edit button',
      async () => {
        mocks.authStore.user = {
          username: 'owner-user',
          role: 'OWNER',
        }

        const wrapper =
          await mountLoadedView()

        await wrapper
          .find(
            '.establishment-edit-button'
          )
          .trigger('click')

        expect(
          mocks.push
        ).toHaveBeenCalledWith({
          name:
            'establishment-edit',

          params: {
            id: 10,
          },
        })
      }
    )


    it(
      'passes the establishment id to the review section',
      async () => {
        const wrapper =
          await mountLoadedView()

        const reviews =
          wrapper.findComponent({
            name:
              'ReviewSectionStub',
          })

        expect(
          reviews.props(
            'targetType'
          )
        ).toBe(
          'establishment'
        )

        expect(
          reviews.props(
            'targetId'
          )
        ).toBe(
          10
        )
      }
    )
  }
)
