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


import OwnerEstablishmentsView
  from '../OwnerEstablishmentsView.vue'


const establishments = [
  {
    id: 1,
    name: 'Restaurante Uno',
    description: 'Descripción uno',
    active: true,
    image_url:
      'https://example.com/one.jpg',

    location: {
      address: 'Calle Mayor 1',
      city: 'Madrid',
    },
  },

  {
    id: 2,
    name: 'Restaurante Dos',
    description: '',
    active: false,
    image_url: '',

    location: {
      address: 'Gran Vía 2',
      city: 'Madrid',
    },
  },
]


function mountView() {
  return shallowMount(
    OwnerEstablishmentsView,
    {
      global: {
        stubs: {
          NavBar: true,
        },
      },
    }
  )
}


beforeEach(() => {
  mocks.get.mockReset()
  mocks.push.mockReset()
})


describe(
  'OwnerEstablishmentsView',
  () => {
    it(
      'loads only the establishments owned by the current user',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: establishments,
        })

        const wrapper =
          mountView()

        await flushPromises()

        expect(
          mocks.get
        ).toHaveBeenCalledTimes(1)

        expect(
          mocks.get
        ).toHaveBeenCalledWith(
          '/establishments/',
          {
            params: {
              mine: true,
            },
          }
        )

        expect(
          wrapper.findAll(
            '.owner-establishment-item'
          )
        ).toHaveLength(2)
      }
    )


    it(
    'shows the loading state while establishments are being loaded',
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
        'Cargando establecimientos...'
        )

        resolveRequest({
        data: establishments,
        })

        await flushPromises()

        expect(
        wrapper.text()
        ).not.toContain(
        'Cargando establecimientos...'
        )
    }
    )


    it(
      'renders establishment information',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: establishments,
        })

        const wrapper =
          mountView()

        await flushPromises()

        expect(
          wrapper.text()
        ).toContain(
          'Restaurante Uno'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Descripción uno'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Calle Mayor 1, Madrid'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Gran Vía 2, Madrid'
        )
      }
    )


    it(
      'shows active and inactive establishment states',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: establishments,
        })

        const wrapper =
          mountView()

        await flushPromises()

        const statuses =
          wrapper.findAll(
            '.owner-establishment-status'
          )

        expect(
          statuses[0].text()
        ).toBe(
          'Activo'
        )

        expect(
          statuses[0].classes()
        ).not.toContain(
          'owner-establishment-status--inactive'
        )

        expect(
          statuses[1].text()
        ).toBe(
          'Inactivo'
        )

        expect(
          statuses[1].classes()
        ).toContain(
          'owner-establishment-status--inactive'
        )
      }
    )


    it(
      'uses the establishment image when available and a fallback otherwise',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: establishments,
        })

        const wrapper =
          mountView()

        await flushPromises()

        const images =
          wrapper.findAll(
            '.owner-establishment-image'
          )

        expect(
          images[0]
            .find('img')
            .attributes('src')
        ).toBe(
          'https://example.com/one.jpg'
        )

        expect(
          images[1]
            .find('img')
            .exists()
        ).toBe(false)

        expect(
          images[1].text()
        ).toContain('📷')
      }
    )


    it(
      'shows an empty state when the owner has no establishments',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: [],
        })

        const wrapper =
          mountView()

        await flushPromises()

        expect(
          wrapper.find(
            '.owner-establishments-empty'
          ).exists()
        ).toBe(true)

        expect(
          wrapper.text()
        ).toContain(
          'Todavía no tienes establecimientos'
        )
      }
    )


    it(
      'shows an error when establishments cannot be loaded',
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
          'No se han podido cargar tus establecimientos.'
        )

        expect(
          wrapper.findAll(
            '.owner-establishment-item'
          )
        ).toHaveLength(0)

        consoleSpy.mockRestore()
      }
    )


    it(
      'shows a fallback when establishment location is unavailable',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: [
            {
              id: 3,
              name: 'Sin ubicación',
              description: '',
              active: true,
              image_url: '',
              location: null,
            },
          ],
        })

        const wrapper =
          mountView()

        await flushPromises()

        expect(
          wrapper.text()
        ).toContain(
          'Ubicación no disponible'
        )
      }
    )


    it(
      'navigates to establishment detail when an item is clicked',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: establishments,
        })

        const wrapper =
          mountView()

        await flushPromises()

        await wrapper
          .findAll(
            '.owner-establishment-item'
          )[0]
          .trigger('click')

        expect(
          mocks.push
        ).toHaveBeenCalledWith(
          '/establishments/1'
        )
      }
    )


    it(
      'navigates to establishment creation',
      async () => {
        mocks.get.mockResolvedValueOnce({
          data: [],
        })

        const wrapper =
          mountView()

        await flushPromises()

        await wrapper
          .find(
            '.owner-establishments-create'
          )
          .trigger('click')

        expect(
          mocks.push
        ).toHaveBeenCalledWith(
          '/owner/establishments/new'
        )
      }
    )
  }
)
