import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  shallowMount,
} from '@vue/test-utils'

import EstablishmentResults
  from '../EstablishmentResults.vue'


const establishments = [
  {
    id: 1,
    name: 'Uno',
  },
  {
    id: 2,
    name: 'Dos',
  },
]


const EstablishmentCardStub = {
  props: [
    'establishment',
  ],

  emits: [
    'select',
    'hover',
    'leave',
  ],

  template: `
    <button
      class="establishment-card-stub"
      :data-id="establishment.id"
      @click="
        $emit(
          'select',
          establishment
        )
      "
      @mouseenter="
        $emit(
          'hover',
          establishment.id
        )
      "
      @mouseleave="
        $emit('leave')
      "
    >
      {{ establishment.name }}
    </button>
  `,
}


function mountResults(
  props = {}
) {
  return shallowMount(
    EstablishmentResults,
    {
      props: {
        establishments,
        loading: false,
        ordering: 'distance',
        ...props,
      },

      global: {
        stubs: {
          EstablishmentCard:
            EstablishmentCardStub,
        },
      },
    }
  )
}


describe(
  'EstablishmentResults',
  () => {
    it(
      'shows the number of results',
      () => {
        const wrapper =
          mountResults()

        expect(
          wrapper.text()
        ).toContain(
          'Resultados (2)'
        )
      }
    )


    it(
      'shows the loading state',
      () => {
        const wrapper =
          mountResults({
            loading: true,
          })

        expect(
          wrapper.text()
        ).toContain(
          'Cargando establecimientos...'
        )

        expect(
          wrapper.find(
            '.results-list'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows the empty state',
      () => {
        const wrapper =
          mountResults({
            establishments: [],
          })

        expect(
          wrapper.text()
        ).toContain(
          'No se han encontrado establecimientos.'
        )
      }
    )


    it(
      'renders one card for each establishment',
      () => {
        const wrapper =
          mountResults()

        expect(
          wrapper.findAll(
            '.establishment-card-stub'
          )
        ).toHaveLength(2)
      }
    )


    it(
      'uses the selected ordering',
      () => {
        const wrapper =
          mountResults({
            ordering:
              '-compatible_percentage',
          })

        expect(
          wrapper
            .find('.results-ordering')
            .element.value
        ).toBe(
          '-compatible_percentage'
        )
      }
    )


    it(
      'emits ordering changes',
      async () => {
        const wrapper =
          mountResults()

        await wrapper
          .find('.results-ordering')
          .setValue('-rating')

        expect(
          wrapper.emitted(
            'update:ordering'
          )
        ).toEqual([
          [
            '-rating',
          ],
        ])
      }
    )


    it(
      'forwards establishment selection',
      async () => {
        const wrapper =
          mountResults()

        await wrapper
          .findAll(
            '.establishment-card-stub'
          )[0]
          .trigger('click')

        expect(
          wrapper.emitted(
            'select-establishment'
          )
        ).toEqual([
          [
            establishments[0],
          ],
        ])
      }
    )


    it(
      'forwards establishment hover',
      async () => {
        const wrapper =
          mountResults()

        await wrapper
          .findAll(
            '.establishment-card-stub'
          )[0]
          .trigger('mouseenter')

        expect(
          wrapper.emitted(
            'hover-establishment'
          )
        ).toEqual([
          [
            1,
          ],
        ])
      }
    )


    it(
      'forwards establishment leave',
      async () => {
        const wrapper =
          mountResults()

        await wrapper
          .findAll(
            '.establishment-card-stub'
          )[0]
          .trigger('mouseleave')

        expect(
          wrapper.emitted(
            'leave-establishment'
          )
        ).toHaveLength(1)
      }
    )
  }
)
