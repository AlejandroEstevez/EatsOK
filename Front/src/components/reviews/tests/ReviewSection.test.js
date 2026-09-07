import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

import { nextTick } from 'vue'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),

  authStore: {
    user: {
      id: 1,
      username: 'alex',
      role: 'CLIENT',
    },
  },
}))

vi.mock('../../../services/api', () => ({
  default: {
    get: mocks.get,
    post: mocks.post,
    patch: mocks.patch,
  },
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

import ReviewSection from '../ReviewSection.vue'

const reviews = [
  {
    id: 1,
    author: 'alex',
    rating: 4,
    comment: 'Muy buena experiencia.',
    publication_date: '2026-09-05T11:55:00Z',
  },

  {
    id: 2,
    author: 'maria',
    rating: 2.5,
    comment: 'Podría mejorar.',
    publication_date: '2026-09-04T12:00:00Z',
  },
]

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

const ReviewModalStub = {
  name: 'ReviewModalStub',

  props: {
    open: Boolean,
    submitting: Boolean,
    error: String,
  },

  emits: ['close', 'submit'],

  template: `
    <div
      class="review-modal-stub"
      :data-open="open"
    ></div>
  `,
}

let wrappers = []

function mountSection(props = {}) {
  const wrapper = shallowMount(ReviewSection, {
    props: {
      targetType: 'establishment',

      targetId: 10,

      ...props,
    },

    global: {
      stubs: {
        StarRating: StarRatingStub,

        ReviewModal: ReviewModalStub,
      },
    },
  })

  wrappers.push(wrapper)

  return wrapper
}

async function mountLoadedSection(props = {}, data = reviews) {
  mocks.get.mockResolvedValue({
    data,
  })

  const wrapper = mountSection(props)

  await flushPromises()

  return wrapper
}

function getModal(wrapper) {
  return wrapper.findComponent({
    name: 'ReviewModalStub',
  })
}

beforeEach(() => {
  mocks.get.mockReset()
  mocks.post.mockReset()
  mocks.patch.mockReset()

  mocks.post.mockResolvedValue({
    data: {},
  })

  mocks.patch.mockResolvedValue({
    data: {},
  })

  mocks.authStore.user = {
    id: 1,
    username: 'alex',
    role: 'CLIENT',
  }
})

afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())

  wrappers = []

  vi.useRealTimers()
})

describe('ReviewSection', () => {
  it('loads establishment reviews on mount', async () => {
    const wrapper = await mountLoadedSection()

    expect(mocks.get).toHaveBeenCalledWith('/reviews/', {
      params: {
        establishment: 10,
      },
    })

    expect(wrapper.findAll('.review-item')).toHaveLength(2)
  })

  it('loads recipe reviews using the recipe parameter', async () => {
    await mountLoadedSection({
      targetType: 'recipe',
      targetId: 20,
    })

    expect(mocks.get).toHaveBeenCalledWith('/reviews/', {
      params: {
        recipe: 20,
      },
    })
  })

  it('calculates and formats the average rating', async () => {
    const wrapper = await mountLoadedSection()

    expect(wrapper.find('.reviews-average').text()).toBe('3,3')

    expect(wrapper.find('.reviews-count').text()).toContain('2 valoraciones')

    const ratings = wrapper.findAllComponents({
      name: 'StarRatingStub',
    })

    expect(ratings[0].props('rating')).toBe(3.25)
  })

  it('shows zero average and empty state when there are no reviews', async () => {
    const wrapper = await mountLoadedSection({}, [])

    expect(wrapper.find('.reviews-average').text()).toBe('0,0')

    expect(wrapper.find('.reviews-count').text()).toContain('0 valoraciones')

    expect(wrapper.text()).toContain('Aún no hay reseñas.')
  })

  it('shows the loading state while reviews are being loaded', async () => {
    let resolveRequest

    mocks.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        })
    )

    const wrapper = mountSection()

    await nextTick()

    expect(wrapper.text()).toContain('Cargando reseñas...')

    resolveRequest({
      data: reviews,
    })

    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando reseñas...')
  })

  it('clears reviews when loading fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mocks.get.mockRejectedValueOnce(new Error('Server error'))

    const wrapper = mountSection()

    await flushPromises()

    expect(wrapper.findAll('.review-item')).toHaveLength(0)

    expect(wrapper.text()).toContain('Aún no hay reseñas.')

    consoleSpy.mockRestore()
  })

  it('renders review author, comment and rating', async () => {
    const wrapper = await mountLoadedSection()

    expect(wrapper.text()).toContain('alex')

    expect(wrapper.text()).toContain('Muy buena experiencia.')

    expect(wrapper.text()).toContain('maria')

    const reviewRatings = wrapper.findAllComponents({
      name: 'StarRatingStub',
    })

    expect(reviewRatings[1].props('rating')).toBe(4)

    expect(reviewRatings[1].props('size')).toBe('small')
  })

  it('uses the first author letter as avatar', async () => {
    const wrapper = await mountLoadedSection()

    const avatars = wrapper.findAll('.review-avatar')

    expect(avatars[0].text()).toBe('A')

    expect(avatars[1].text()).toBe('M')
  })

  it('shows the write review button to clients', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'CLIENT',
    }

    const wrapper = await mountLoadedSection()

    expect(wrapper.find('.write-review-button').exists()).toBe(true)
  })

  it('hides the write review button from admins', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'ADMIN',
    }

    const wrapper = await mountLoadedSection()

    expect(wrapper.find('.write-review-button').exists()).toBe(false)
  })

  it('opens and closes the review modal', async () => {
    const wrapper = await mountLoadedSection()

    await wrapper.find('.write-review-button').trigger('click')

    expect(getModal(wrapper).props('open')).toBe(true)

    getModal(wrapper).vm.$emit('close')

    await nextTick()

    expect(getModal(wrapper).props('open')).toBe(false)
  })

  it('creates an establishment review and reloads reviews', async () => {
    const wrapper = await mountLoadedSection()

    await wrapper.find('.write-review-button').trigger('click')

    getModal(wrapper).vm.$emit('submit', {
      rating: 4.5,
      comment: 'Muy recomendable',
    })

    await flushPromises()

    expect(mocks.post).toHaveBeenCalledWith('/reviews/', {
      establishment: 10,
      rating: 4.5,
      comment: 'Muy recomendable',
    })

    expect(getModal(wrapper).props('open')).toBe(false)

    expect(mocks.get.mock.calls.filter(([url]) => url === '/reviews/')).toHaveLength(2)
  })

  it('creates a review using the recipe target', async () => {
    const wrapper = await mountLoadedSection({
      targetType: 'recipe',
      targetId: 20,
    })

    await wrapper.find('.write-review-button').trigger('click')

    getModal(wrapper).vm.$emit('submit', {
      rating: 5,
      comment: 'Perfecta',
    })

    await flushPromises()

    expect(mocks.post).toHaveBeenCalledWith('/reviews/', {
      recipe: 20,
      rating: 5,
      comment: 'Perfecta',
    })
  })

  it('shows a backend validation error when review creation fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mocks.post.mockRejectedValueOnce({
      response: {
        data: {
          non_field_errors: ['Ya has publicado una reseña.'],
        },
      },
    })

    const wrapper = await mountLoadedSection()

    await wrapper.find('.write-review-button').trigger('click')

    getModal(wrapper).vm.$emit('submit', {
      rating: 4,
      comment: '',
    })

    await flushPromises()

    expect(getModal(wrapper).props('error')).toBe('Ya has publicado una reseña.')

    expect(getModal(wrapper).props('open')).toBe(true)

    consoleSpy.mockRestore()
  })

  it('shows rating validation errors from the backend', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mocks.post.mockRejectedValueOnce({
      response: {
        data: {
          rating: ['La valoración no es válida.'],
        },
      },
    })

    const wrapper = await mountLoadedSection()

    await wrapper.find('.write-review-button').trigger('click')

    getModal(wrapper).vm.$emit('submit', {
      rating: 0,
      comment: '',
    })

    await flushPromises()

    expect(getModal(wrapper).props('error')).toBe('La valoración no es válida.')

    consoleSpy.mockRestore()
  })

  it('shows moderation buttons only to admins', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'ADMIN',
    }

    const wrapper = await mountLoadedSection()

    expect(wrapper.findAll('.hide-review-button')).toHaveLength(2)
  })

  it('does not hide a review when confirmation is cancelled', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'ADMIN',
    }

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    const wrapper = await mountLoadedSection()

    await wrapper.find('.hide-review-button').trigger('click')

    expect(mocks.patch).not.toHaveBeenCalled()

    expect(wrapper.findAll('.review-item')).toHaveLength(2)

    confirmSpy.mockRestore()
  })

  it('hides a confirmed review', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'ADMIN',
    }

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountLoadedSection()

    await wrapper.find('.hide-review-button').trigger('click')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledWith('/reviews/1/moderation/', {
      visible: false,
    })

    expect(wrapper.findAll('.review-item')).toHaveLength(1)

    expect(wrapper.text()).not.toContain('Muy buena experiencia.')

    confirmSpy.mockRestore()
  })

  it('keeps the review when moderation fails', async () => {
    mocks.authStore.user = {
      id: 1,
      role: 'ADMIN',
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    mocks.patch.mockRejectedValueOnce(new Error('Moderation error'))

    const wrapper = await mountLoadedSection()

    await wrapper.find('.hide-review-button').trigger('click')

    await flushPromises()

    expect(wrapper.findAll('.review-item')).toHaveLength(2)

    confirmSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('reloads reviews when the target changes', async () => {
    const wrapper = await mountLoadedSection()

    mocks.get.mockClear()

    mocks.get.mockResolvedValue({
      data: [],
    })

    await wrapper.setProps({
      targetType: 'recipe',
      targetId: 30,
    })

    await flushPromises()

    expect(mocks.get).toHaveBeenCalledWith('/reviews/', {
      params: {
        recipe: 30,
      },
    })
  })

  it('formats relative review dates', async () => {
    vi.useFakeTimers()

    vi.setSystemTime(new Date('2026-09-05T12:00:00Z'))

    const wrapper = await mountLoadedSection({}, [
      {
        id: 1,
        author: 'alex',
        rating: 5,
        comment: '',
        publication_date: '2026-09-05T11:55:00Z',
      },
    ])

    expect(wrapper.find('.review-date').text()).toBe('Hace 5 minutos')
  })
})
