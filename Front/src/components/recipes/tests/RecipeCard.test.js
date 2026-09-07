import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import RecipeCard from '../RecipeCard.vue'

function makeRecipe(overrides = {}) {
  return {
    id: 1,
    title: 'Pasta sin gluten',
    description: 'Una receta sencilla.',
    image_url: 'https://example.com/pasta.jpg',
    preparation_time: 30,
    author: 'alex',
    average_rating: 4.36,
    review_count: 12,

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

    ...overrides,
  }
}

function mountCard(overrides = {}) {
  return shallowMount(RecipeCard, {
    props: {
      recipe: makeRecipe(overrides),
    },
  })
}

describe('RecipeCard', () => {
  it('renders recipe information', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Pasta sin gluten')

    expect(wrapper.text()).toContain('Una receta sencilla.')

    expect(wrapper.text()).toContain('30 min')

    expect(wrapper.text()).toContain('alex')
  })

  it('renders the recipe image when available', () => {
    const wrapper = mountCard()

    const image = wrapper.find('.recipe-card-image img')

    expect(image.exists()).toBe(true)

    expect(image.attributes('src')).toBe('https://example.com/pasta.jpg')

    expect(image.attributes('alt')).toBe('Pasta sin gluten')
  })

  it('shows an image placeholder when there is no image', () => {
    const wrapper = mountCard({
      image_url: '',
    })

    expect(wrapper.find('.recipe-card-image img').exists()).toBe(false)

    expect(wrapper.find('.recipe-card-image-placeholder').text()).toContain('📷')
  })

  it('formats adapted allergies and diets', () => {
    const wrapper = mountCard()

    const badges = wrapper.findAll('.recipe-adapted-badge')

    expect(badges).toHaveLength(2)

    expect(badges[0].text()).toContain('Sin gluten')

    expect(badges[1].text()).toContain('Vegano')
  })

  it('formats the average rating with one decimal and comma', () => {
    const wrapper = mountCard({
      average_rating: 4.36,
    })

    expect(wrapper.find('.recipe-rating-value').text()).toBe('4,4')

    expect(wrapper.find('.recipe-rating-count').text()).toBe('(12)')
  })

  it('shows no ratings message when rating is null', () => {
    const wrapper = mountCard({
      average_rating: null,
    })

    expect(wrapper.find('.recipe-no-rating').text()).toBe('Sin valoraciones')

    expect(wrapper.find('.recipe-rating-value').exists()).toBe(false)
  })

  it('hides description when it is empty', () => {
    const wrapper = mountCard({
      description: '',
    })

    expect(wrapper.find('.recipe-card-description').exists()).toBe(false)
  })

  it('emits the selected recipe from the view button', async () => {
    const recipe = makeRecipe()

    const wrapper = shallowMount(RecipeCard, {
      props: {
        recipe,
      },
    })

    await wrapper.find('.recipe-view-button').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[recipe]])
  })
})
