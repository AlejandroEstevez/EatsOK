import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  logout: vi.fn(),

  authStore: {
    isAuthenticated: false,
    user: null,
    logout: null,
  },
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

import NavBar from '../NavBar.vue'

const RouterLinkStub = {
  props: ['to'],

  template: `
    <a
      class="router-link-stub"
      :data-to="to"
    >
      <slot />
    </a>
  `,
}

function mountNavBar() {
  return shallowMount(NavBar, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        UserAvatar: true,
      },
    },
  })
}

function authenticate(role = 'CLIENT') {
  mocks.authStore.isAuthenticated = true

  mocks.authStore.user = {
    username: 'alex',
    role,
  }
}

beforeEach(() => {
  mocks.push.mockReset()
  mocks.logout.mockReset()

  mocks.logout.mockResolvedValue()

  mocks.authStore.isAuthenticated = false
  mocks.authStore.user = null
  mocks.authStore.logout = mocks.logout
})

describe('NavBar', () => {
  it('shows the login link when the user is not authenticated', () => {
    const wrapper = mountNavBar()

    expect(wrapper.text()).toContain('Acceder')

    expect(wrapper.find('.navbar-account').exists()).toBe(false)
  })

  it('shows the authenticated username', () => {
    authenticate()

    const wrapper = mountNavBar()

    expect(wrapper.text()).toContain('alex')

    expect(wrapper.text()).not.toContain('Acceder')
  })

  it('opens the account menu', async () => {
    authenticate()

    const wrapper = mountNavBar()

    expect(wrapper.find('.account-dropdown').exists()).toBe(false)

    await wrapper.find('.navbar-account').trigger('click')

    expect(wrapper.find('.account-dropdown').exists()).toBe(true)

    expect(wrapper.text()).toContain('Editar datos')

    expect(wrapper.text()).toContain('Cerrar sesión')
  })

  it('does not show privileged options to a client', async () => {
    authenticate('CLIENT')

    const wrapper = mountNavBar()

    await wrapper.find('.navbar-account').trigger('click')

    expect(wrapper.text()).not.toContain('Registrar propietario')

    expect(wrapper.text()).not.toContain('Gestionar establecimientos')
  })

  it('shows owner registration to an administrator', async () => {
    authenticate('ADMIN')

    const wrapper = mountNavBar()

    await wrapper.find('.navbar-account').trigger('click')

    expect(wrapper.text()).toContain('Registrar propietario')

    expect(wrapper.text()).not.toContain('Gestionar establecimientos')
  })

  it('shows establishment management to an owner', async () => {
    authenticate('OWNER')

    const wrapper = mountNavBar()

    await wrapper.find('.navbar-account').trigger('click')

    expect(wrapper.text()).toContain('Gestionar establecimientos')

    expect(wrapper.text()).not.toContain('Registrar propietario')
  })

  it('logs out and redirects to the home page', async () => {
    authenticate()

    const wrapper = mountNavBar()

    await wrapper.find('.navbar-account').trigger('click')

    await wrapper.find('.logout-item').trigger('click')

    await flushPromises()

    expect(mocks.logout).toHaveBeenCalledTimes(1)

    expect(mocks.push).toHaveBeenCalledWith('/')

    expect(wrapper.text()).toContain('Sesión cerrada')

    expect(wrapper.text()).toContain('Has cerrado sesión correctamente.')
  })

  it('closes the logout confirmation message', async () => {
    authenticate()

    const wrapper = mountNavBar()

    await wrapper.find('.navbar-account').trigger('click')

    await wrapper.find('.logout-item').trigger('click')

    await flushPromises()

    expect(wrapper.find('.logout-message-overlay').exists()).toBe(true)

    await wrapper.find('.logout-message button').trigger('click')

    expect(wrapper.find('.logout-message-overlay').exists()).toBe(false)
  })
})
