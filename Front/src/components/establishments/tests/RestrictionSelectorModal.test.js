import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  shallowMount,
} from '@vue/test-utils'

import RestrictionSelectorModal
  from '../RestrictionSelectorModal.vue'


const restrictions = [
  {
    id: 1,
    name: 'Gluten',
    type: 'allergy',
  },
  {
    id: 2,
    name: 'Frutos secos',
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


function mountModal(
  props = {}
) {
  return shallowMount(
    RestrictionSelectorModal,
    {
      props: {
        open: false,
        type: 'allergy',
        restrictions,
        selectedRestrictions: [],
        ...props,
      },
    }
  )
}


describe(
  'RestrictionSelectorModal',
  () => {
    it(
      'is hidden when open is false',
      () => {
        const wrapper =
          mountModal()

        expect(
          wrapper.find(
            '.restriction-modal-backdrop'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows only allergy restrictions',
      async () => {
        const wrapper =
          mountModal()

        await wrapper.setProps({
          open: true,
        })

        expect(
          wrapper.text()
        ).toContain(
          'Añadir alergias e intolerancias'
        )

        expect(
          wrapper.text()
        ).toContain('Gluten')

        expect(
          wrapper.text()
        ).toContain(
          'Frutos secos'
        )

        expect(
          wrapper.text()
        ).not.toContain(
          'Vegano'
        )

        expect(
          wrapper.text()
        ).not.toContain(
          'Halal'
        )
      }
    )


    it(
      'shows only diet restrictions',
      async () => {
        const wrapper =
          mountModal({
            type: 'diet',
          })

        await wrapper.setProps({
          open: true,
        })

        expect(
          wrapper.text()
        ).toContain(
          'Añadir preferencias'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Vegano'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Halal'
        )

        expect(
          wrapper.text()
        ).not.toContain(
          'Gluten'
        )
      }
    )


    it(
      'copies the selected restrictions when opened',
      async () => {
        const wrapper =
          mountModal({
            selectedRestrictions: [
              1,
            ],
          })

        await wrapper.setProps({
          open: true,
        })

        const checkboxes =
          wrapper.findAll(
            'input[type="checkbox"]'
          )

        expect(
          checkboxes[0]
            .element.checked
        ).toBe(true)

        expect(
          checkboxes[1]
            .element.checked
        ).toBe(false)
      }
    )


    it(
      'adds a restriction to the temporary selection',
      async () => {
        const wrapper =
          mountModal()

        await wrapper.setProps({
          open: true,
        })

        const checkboxes =
          wrapper.findAll(
            'input[type="checkbox"]'
          )

        await checkboxes[1]
          .setValue(true)

        await wrapper
          .find(
            '.restriction-modal-confirm'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'confirm'
          )
        ).toEqual([
          [
            [
              2,
            ],
          ],
        ])
      }
    )


    it(
      'removes a previously selected restriction',
      async () => {
        const wrapper =
          mountModal({
            selectedRestrictions: [
              1,
              2,
            ],
          })

        await wrapper.setProps({
          open: true,
        })

        const checkboxes =
          wrapper.findAll(
            'input[type="checkbox"]'
          )

        await checkboxes[0]
          .setValue(false)

        await wrapper
          .find(
            '.restriction-modal-confirm'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'confirm'
          )
        ).toEqual([
          [
            [
              2,
            ],
          ],
        ])
      }
    )


    it(
      'emits close from the close button',
      async () => {
        const wrapper =
          mountModal()

        await wrapper.setProps({
          open: true,
        })

        await wrapper
          .find(
            '.restriction-modal-close'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'close'
          )
        ).toHaveLength(1)
      }
    )


    it(
      'emits close from the cancel button',
      async () => {
        const wrapper =
          mountModal()

        await wrapper.setProps({
          open: true,
        })

        await wrapper
          .find(
            '.restriction-modal-cancel'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'close'
          )
        ).toHaveLength(1)
      }
    )


    it(
      'emits close when the backdrop itself is clicked',
      async () => {
        const wrapper =
          mountModal()

        await wrapper.setProps({
          open: true,
        })

        await wrapper
          .find(
            '.restriction-modal-backdrop'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'close'
          )
        ).toHaveLength(1)
      }
    )
  }
)
