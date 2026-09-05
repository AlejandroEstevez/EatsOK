import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  shallowMount,
} from '@vue/test-utils'

import EstablishmentCard
  from '../EstablishmentCard.vue'


function makeEstablishment(
  overrides = {}
) {
  return {
    id: 1,
    name: 'Restaurante Test',
    compatible_percentage: 85,
    average_rating: 4.36,
    review_count: 12,
    distance: 2.4,
    tags: [
      {
        id: 1,
        name: 'Italiano',
      },
      {
        id: 2,
        name: 'Familiar',
      },
    ],
    compatible_dishes: 4,
    total_dishes: 5,
    ...overrides,
  }
}


function mountCard(
  overrides = {}
) {
  return shallowMount(
    EstablishmentCard,
    {
      props: {
        establishment:
          makeEstablishment(
            overrides
          ),
      },
    }
  )
}


describe(
  'EstablishmentCard',
  () => {
    it(
      'renders establishment information',
      () => {
        const wrapper =
          mountCard()

        expect(
          wrapper.text()
        ).toContain(
          'Restaurante Test'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Italiano'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Familiar'
        )

        expect(
          wrapper.text()
        ).toContain(
          '4'
        )

        expect(
          wrapper.text()
        ).toContain(
          '5'
        )
      }
    )


    it(
      'shows high compatibility',
      () => {
        const wrapper =
          mountCard({
            compatible_percentage: 85,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-badge--high'
        )

        expect(
          badge.text()
        ).toContain('Alta')

        expect(
          badge.text()
        ).toContain('85%')
      }
    )


    it(
      'shows medium compatibility',
      () => {
        const wrapper =
          mountCard({
            compatible_percentage: 60,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-badge--medium'
        )

        expect(
          badge.text()
        ).toContain('Media')
      }
    )


    it(
      'shows low compatibility',
      () => {
        const wrapper =
          mountCard({
            compatible_percentage: 25,
          })

        const badge =
          wrapper.find(
            '.compatibility-badge'
          )

        expect(
          badge.classes()
        ).toContain(
          'compatibility-badge--low'
        )

        expect(
          badge.text()
        ).toContain('Baja')
      }
    )


    it(
      'rounds compatibility percentage',
      () => {
        const wrapper =
          mountCard({
            compatible_percentage:
              84.6,
          })

        expect(
          wrapper
            .find(
              '.compatibility-badge'
            )
            .text()
        ).toContain('85%')
      }
    )


    it(
      'formats the average rating with one decimal',
      () => {
        const wrapper =
          mountCard({
            average_rating: 4.36,
          })

        expect(
          wrapper
            .find(
              '.establishment-rating'
            )
            .text()
        ).toContain('4.4')

        expect(
          wrapper
            .find(
              '.establishment-review-count'
            )
            .text()
        ).toContain('(12)')
      }
    )


    it(
      'shows no ratings message when average rating is null',
      () => {
        const wrapper =
          mountCard({
            average_rating: null,
          })

        expect(
          wrapper.text()
        ).toContain(
          'Sin valoraciones'
        )

        expect(
          wrapper.find(
            '.establishment-rating'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows distance when available',
      () => {
        const wrapper =
          mountCard({
            distance: 2.4,
          })

        expect(
          wrapper.text()
        ).toContain(
          '2.4 km'
        )
      }
    )


    it(
      'emits select with the establishment when clicked',
      async () => {
        const establishment =
          makeEstablishment()

        const wrapper =
          shallowMount(
            EstablishmentCard,
            {
              props: {
                establishment,
              },
            }
          )

        await wrapper.trigger(
          'click'
        )

        expect(
          wrapper.emitted(
            'select'
          )
        ).toEqual([
          [
            establishment,
          ],
        ])
      }
    )


    it(
      'emits hover with the establishment id',
      async () => {
        const wrapper =
          mountCard()

        await wrapper.trigger(
          'mouseenter'
        )

        expect(
          wrapper.emitted(
            'hover'
          )
        ).toEqual([
          [
            1,
          ],
        ])
      }
    )


    it(
      'emits leave when the pointer leaves the card',
      async () => {
        const wrapper =
          mountCard()

        await wrapper.trigger(
          'mouseleave'
        )

        expect(
          wrapper.emitted(
            'leave'
          )
        ).toHaveLength(1)
      }
    )
  }
)
