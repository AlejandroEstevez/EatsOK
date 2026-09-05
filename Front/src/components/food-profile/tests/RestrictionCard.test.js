import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  shallowMount,
} from '@vue/test-utils'

import RestrictionCard from '../RestrictionCard.vue'


const allergy = {
  id: 1,
  name: 'Gluten',
  type: 'allergy',
}


const diet = {
  id: 2,
  name: 'Vegano',
  type: 'diet',
}


function mountCard(
  props = {}
) {
  return shallowMount(
    RestrictionCard,
    {
      props: {
        restriction: allergy,
        selected: false,
        summary: false,
        ...props,
      },
    }
  )
}


describe(
  'RestrictionCard',
  () => {
    it(
      'renders the restriction name',
      () => {
        const wrapper =
          mountCard()

        expect(
          wrapper
            .find('.restriction-name')
            .text()
        ).toBe(
          'Gluten'
        )
      }
    )


    it(
      'applies the allergy class',
      () => {
        const wrapper =
          mountCard()

        expect(
          wrapper.classes()
        ).toContain(
          'restriction-card--allergy'
        )
      }
    )


    it(
      'applies the diet class',
      () => {
        const wrapper =
          mountCard({
            restriction: diet,
          })

        expect(
          wrapper.classes()
        ).toContain(
          'restriction-card--diet'
        )
      }
    )


    it(
      'does not appear selected by default',
      () => {
        const wrapper =
          mountCard()

        expect(
          wrapper.classes()
        ).not.toContain(
          'restriction-card--selected'
        )

        expect(
          wrapper.find(
            '.restriction-check'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows selected state and check icon',
      () => {
        const wrapper =
          mountCard({
            selected: true,
          })

        expect(
          wrapper.classes()
        ).toContain(
          'restriction-card--selected'
        )

        expect(
          wrapper.find(
            '.restriction-check'
          ).exists()
        ).toBe(true)
      }
    )


    it(
      'applies summary state without showing the check',
      () => {
        const wrapper =
          mountCard({
            selected: true,
            summary: true,
          })

        expect(
          wrapper.classes()
        ).toContain(
          'restriction-card--selected'
        )

        expect(
          wrapper.classes()
        ).toContain(
          'restriction-card--summary'
        )

        expect(
          wrapper.find(
            '.restriction-check'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'emits the restriction id when clicked',
      async () => {
        const wrapper =
          mountCard()

        await wrapper.trigger(
          'click'
        )

        expect(
          wrapper.emitted(
            'toggle'
          )
        ).toEqual([
          [
            1,
          ],
        ])
      }
    )
  }
)
