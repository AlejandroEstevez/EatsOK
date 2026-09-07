import { describe, expect, it } from 'vitest'

import { shallowMount } from '@vue/test-utils'

import { nextTick } from 'vue'

import ReviewModal from '../ReviewModal.vue'

const StarRatingStub = {
  name: 'StarRatingStub',

  props: {
    rating: Number,
    size: String,
  },

  template: `
    <div
      class="star-rating-stub"
      :data-rating="rating"
      :data-size="size"
    ></div>
  `,
}

function mountModal(props = {}) {
  return shallowMount(ReviewModal, {
    props: {
      open: false,
      submitting: false,
      error: '',
      ...props,
    },

    global: {
      stubs: {
        StarRating: StarRatingStub,
      },
    },
  })
}

describe('ReviewModal', () => {
  it('is hidden when closed', () => {
    const wrapper = mountModal()

    expect(wrapper.find('.review-modal-backdrop').exists()).toBe(false)
  })

  it('opens with an empty review', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    expect(wrapper.find('.review-rating-slider').element.value).toBe('0')

    expect(wrapper.find('#review-comment').element.value).toBe('')

    expect(wrapper.find('.review-rating-heading strong').text()).toBe('0.0')
  })

  it('updates the rating and star preview', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-rating-slider').setValue('4.3')

    await nextTick()

    expect(wrapper.find('.review-rating-heading strong').text()).toBe('4.3')

    expect(
      wrapper
        .findComponent({
          name: 'StarRatingStub',
        })
        .props('rating')
    ).toBe(4.3)
  })

  it('emits a normalized review payload', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-rating-slider').setValue('4.5')

    await wrapper.find('#review-comment').setValue('  Muy buena experiencia  ')

    await wrapper.find('.review-modal-submit').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          rating: 4.5,
          comment: 'Muy buena experiencia',
        },
      ],
    ])
  })

  it('allows submitting an empty comment', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-rating-slider').setValue('3')

    await wrapper.find('.review-modal-submit').trigger('click')

    expect(wrapper.emitted('submit')[0][0]).toEqual({
      rating: 3,
      comment: '',
    })
  })

  it('resets rating and comment whenever it is opened again', async () => {
    const wrapper = mountModal()

    await wrapper.setProps({
      open: true,
    })

    await wrapper.find('.review-rating-slider').setValue('5')

    await wrapper.find('#review-comment').setValue('Comentario')

    await wrapper.setProps({
      open: false,
    })

    await wrapper.setProps({
      open: true,
    })

    expect(wrapper.find('.review-rating-slider').element.value).toBe('0')

    expect(wrapper.find('#review-comment').element.value).toBe('')
  })

  it('shows the supplied error', async () => {
    const wrapper = mountModal({
      open: true,
      error: 'Ya has publicado una reseña.',
    })

    expect(wrapper.find('.review-modal-error').text()).toBe('Ya has publicado una reseña.')
  })

  it('shows submitting state and disables actions', () => {
    const wrapper = mountModal({
      open: true,
      submitting: true,
    })

    expect(wrapper.find('.review-modal-submit').text()).toBe('Publicando...')

    expect(wrapper.find('.review-modal-submit').attributes('disabled')).toBeDefined()

    expect(wrapper.find('.review-modal-cancel').attributes('disabled')).toBeDefined()

    expect(wrapper.find('.review-modal-close').attributes('disabled')).toBeDefined()
  })

  it('emits close from the close button', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-modal-close').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close from the cancel button', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-modal-cancel').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when the backdrop itself is clicked', async () => {
    const wrapper = mountModal({
      open: true,
    })

    await wrapper.find('.review-modal-backdrop').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
