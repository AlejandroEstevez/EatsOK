import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  shallowMount,
} from '@vue/test-utils'

import RecipeDetailPanel
  from '../RecipeDetailPanel.vue'


const baseRecipe = {
  id: 10,
  title: 'Tarta sin gluten',
  description:
    'Una tarta sencilla y adaptada.',
  image_url:
    'https://example.com/tarta.jpg',
  preparation_time: 45,
  author: 'alex',
  establishment_name:
    'Restaurante Test',

  ingredients: [
    '- 200 g de harina',
    '- 2 huevos',
    '- 100 g de azúcar',
  ].join('\n'),

  steps: [
    '1. Mezclar los ingredientes',
    '2. Hornear durante 30 minutos',
  ].join('\n'),

  adapted_restrictions: [
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


function makeRecipe(
  overrides = {}
) {
  return {
    ...baseRecipe,
    ...overrides,
  }
}


function mountPanel(
  props = {}
) {
  return shallowMount(
    RecipeDetailPanel,
    {
      props: {
        recipe:
          makeRecipe(),
        loading: false,
        error: '',
        canManage: false,
        deleting: false,
        ...props,
      },

      global: {
        stubs: {
          ReviewSection:
            ReviewSectionStub,
        },
      },
    }
  )
}


describe(
  'RecipeDetailPanel',
  () => {
    it(
      'is hidden when no recipe is selected',
      () => {
        const wrapper =
          mountPanel({
            recipe: null,
          })

        expect(
          wrapper.find(
            '.recipe-detail-overlay'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows the loading state',
      () => {
        const wrapper =
          mountPanel({
            loading: true,
          })

        expect(
          wrapper.text()
        ).toContain(
          'Cargando receta...'
        )

        expect(
          wrapper.find(
            '.recipe-detail-header'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows the error state',
      () => {
        const wrapper =
          mountPanel({
            error:
              'No se ha podido cargar la receta.',
          })

        expect(
          wrapper.find(
            '.recipe-detail-error'
          ).text()
        ).toBe(
          'No se ha podido cargar la receta.'
        )

        expect(
          wrapper.find(
            '.recipe-detail-header'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'renders the recipe information',
      () => {
        const wrapper =
          mountPanel()

        expect(
          wrapper.text()
        ).toContain(
          'Tarta sin gluten'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Una tarta sencilla y adaptada.'
        )

        expect(
          wrapper.text()
        ).toContain(
          '45 min'
        )

        expect(
          wrapper.text()
        ).toContain(
          'alex'
        )

        expect(
          wrapper.text()
        ).toContain(
          'Restaurante Test'
        )

        const image =
          wrapper.find(
            '.recipe-detail-image img'
          )

        expect(
          image.attributes('src')
        ).toBe(
          'https://example.com/tarta.jpg'
        )

        expect(
          image.attributes('alt')
        ).toBe(
          'Tarta sin gluten'
        )
      }
    )


    it(
      'shows a placeholder when the recipe has no image',
      () => {
        const wrapper =
          mountPanel({
            recipe:
              makeRecipe({
                image_url: '',
              }),
          })

        expect(
          wrapper.find(
            '.recipe-detail-image img'
          ).exists()
        ).toBe(false)

        expect(
          wrapper.find(
            '.recipe-detail-image'
          ).text()
        ).toContain('📷')
      }
    )


    it(
      'formats adapted allergy and diet restrictions',
      () => {
        const wrapper =
          mountPanel()

        const badges =
          wrapper.findAll(
            '.recipe-detail-badge'
          )

        expect(
          badges
        ).toHaveLength(2)

        expect(
          badges[0].text()
        ).toContain(
          'Sin gluten'
        )

        expect(
          badges[1].text()
        ).toContain(
          'Vegano'
        )
      }
    )


    it(
      'splits and cleans ingredient lines',
      () => {
        const wrapper =
          mountPanel()

        const ingredients =
          wrapper.findAll(
            '.recipe-detail-list li'
          )

        expect(
          ingredients
        ).toHaveLength(3)

        expect(
          ingredients[0].text()
        ).toBe(
          '200 g de harina'
        )

        expect(
          ingredients[1].text()
        ).toBe(
          '2 huevos'
        )

        expect(
          ingredients[2].text()
        ).toBe(
          '100 g de azúcar'
        )
      }
    )


    it(
      'splits and cleans numbered preparation steps',
      () => {
        const wrapper =
          mountPanel()

        const steps =
          wrapper.findAll(
            '.recipe-detail-steps li'
          )

        expect(
          steps
        ).toHaveLength(2)

        expect(
          steps[0].text()
        ).toBe(
          'Mezclar los ingredientes'
        )

        expect(
          steps[1].text()
        ).toBe(
          'Hornear durante 30 minutos'
        )
      }
    )


    it(
      'shows empty messages when ingredients and steps are missing',
      () => {
        const wrapper =
          mountPanel({
            recipe:
              makeRecipe({
                ingredients: '',
                steps: '',
              }),
          })

        expect(
          wrapper.text()
        ).toContain(
          'No se han indicado ingredientes.'
        )

        expect(
          wrapper.text()
        ).toContain(
          'No se han indicado pasos de elaboración.'
        )
      }
    )


    it(
      'hides management actions when the user cannot manage the recipe',
      () => {
        const wrapper =
          mountPanel({
            canManage: false,
          })

        expect(
          wrapper.find(
            '.recipe-detail-actions'
          ).exists()
        ).toBe(false)
      }
    )


    it(
      'shows management actions and emits edit',
      async () => {
        const recipe =
          makeRecipe()

        const wrapper =
          mountPanel({
            recipe,
            canManage: true,
          })

        expect(
          wrapper.find(
            '.recipe-detail-actions'
          ).exists()
        ).toBe(true)

        await wrapper
          .find(
            '.recipe-detail-edit-button'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'edit'
          )
        ).toEqual([
          [
            recipe,
          ],
        ])
      }
    )


    it(
      'emits delete for the selected recipe',
      async () => {
        const recipe =
          makeRecipe()

        const wrapper =
          mountPanel({
            recipe,
            canManage: true,
          })

        await wrapper
          .find(
            '.recipe-detail-delete-button'
          )
          .trigger('click')

        expect(
          wrapper.emitted(
            'delete'
          )
        ).toEqual([
          [
            recipe,
          ],
        ])
      }
    )


    it(
      'shows deleting state',
      () => {
        const wrapper =
          mountPanel({
            canManage: true,
            deleting: true,
          })

        const button =
          wrapper.find(
            '.recipe-detail-delete-button'
          )

        expect(
          button.text()
        ).toBe(
          'Eliminando...'
        )

        expect(
          button.attributes(
            'disabled'
          )
        ).toBeDefined()
      }
    )


    it(
      'emits close from the back button',
      async () => {
        const wrapper =
          mountPanel()

        await wrapper
          .find(
            '.recipe-detail-back'
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
      'emits close when the overlay is clicked',
      async () => {
        const wrapper =
          mountPanel()

        await wrapper
          .find(
            '.recipe-detail-overlay'
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
      'passes the recipe id to the review section',
      () => {
        const wrapper =
          mountPanel()

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
          'recipe'
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
