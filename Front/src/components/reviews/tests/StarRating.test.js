import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import StarRating from '../StarRating.vue'

function mountRating(props = {}) {
  return shallowMount(StarRating, {
    props: {
      rating: 0,
      size: 'normal',
      ...props,
    },
  })
}

describe('StarRating', () => {
  it('renders five stars', () => {
    const wrapper = mountRating()

    expect(wrapper.findAll('.star-rating-star')).toHaveLength(5)
  })

  it('applies the selected size', () => {
    const wrapper = mountRating({
      size: 'large',
    })

    expect(wrapper.find('.star-rating').classes()).toContain('star-rating--large')
  })

  it('fills complete and empty stars according to rating', () => {
    const wrapper = mountRating({
      rating: 3,
    })

    const stars = wrapper.findAll('.star-rating-star')

    expect(stars[0].attributes('style')).toContain('100%')

    expect(stars[1].attributes('style')).toContain('100%')

    expect(stars[2].attributes('style')).toContain('100%')

    expect(stars[3].attributes('style')).toContain('0%')

    expect(stars[4].attributes('style')).toContain('0%')
  })

  it('renders a partially filled star for decimal ratings', () => {
    const wrapper = mountRating({
      rating: 3.5,
    })

    const stars = wrapper.findAll('.star-rating-star')

    expect(stars[3].attributes('style')).toContain('50%')
  })
})
