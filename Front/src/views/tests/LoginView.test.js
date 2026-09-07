import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),

  authStore: {
    login: null,
  },
}))

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}))

import LoginView from '../LoginView.vue'

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

function mountLogin() {
  return shallowMount(LoginView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        AccessBrand: true,
      },
    },
  })
}

async function fillLoginForm(
  wrapper,
  { email = 'alex@example.com', password = 'password123', rememberMe = false } = {}
) {
  await wrapper.find('#email').setValue(email)

  await wrapper.find('#password').setValue(password)

  if (rememberMe) {
    await wrapper.find('.remember-option input').setValue(true)
  }
}

beforeEach(() => {
  mocks.push.mockReset()
  mocks.login.mockReset()

  mocks.login.mockResolvedValue()

  mocks.authStore.login = mocks.login
})

describe('LoginView', () => {
  it('renders the login form', () => {
    const wrapper = mountLogin()

    expect(wrapper.text()).toContain('¡Bienvenido de nuevo!')

    expect(wrapper.text()).toContain('Inicia sesión para continuar')

    expect(wrapper.find('#email').exists()).toBe(true)

    expect(wrapper.find('#password').exists()).toBe(true)

    expect(wrapper.find('.submit-login').text()).toBe('Iniciar sesión')
  })

  it('uses password type by default', () => {
    const wrapper = mountLogin()

    expect(wrapper.find('#password').attributes('type')).toBe('password')

    expect(wrapper.find('.password-toggle').attributes('aria-label')).toBe('Mostrar contraseña')
  })

  it('toggles password visibility', async () => {
    const wrapper = mountLogin()

    await wrapper.find('.password-toggle').trigger('click')

    expect(wrapper.find('#password').attributes('type')).toBe('text')

    expect(wrapper.find('.password-toggle').attributes('aria-label')).toBe('Ocultar contraseña')

    await wrapper.find('.password-toggle').trigger('click')

    expect(wrapper.find('#password').attributes('type')).toBe('password')
  })

  it('logs in with the entered credentials and redirects home', async () => {
    const wrapper = mountLogin()

    await fillLoginForm(wrapper)

    await wrapper.find('.login-form').trigger('submit')

    await flushPromises()

    expect(mocks.login).toHaveBeenCalledTimes(1)

    expect(mocks.login).toHaveBeenCalledWith('alex@example.com', 'password123', false)

    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('passes rememberMe when the option is selected', async () => {
    const wrapper = mountLogin()

    await fillLoginForm(wrapper, {
      rememberMe: true,
    })

    await wrapper.find('.login-form').trigger('submit')

    await flushPromises()

    expect(mocks.login).toHaveBeenCalledWith('alex@example.com', 'password123', true)
  })

  it('shows a specific message for invalid credentials', async () => {
    mocks.login.mockRejectedValueOnce({
      response: {
        status: 401,
      },
    })

    const wrapper = mountLogin()

    await fillLoginForm(wrapper)

    await wrapper.find('.login-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.login-error').exists()).toBe(true)

    expect(wrapper.find('.login-error').text()).toBe(
      'El correo electrónico o la contraseña no son correctos.'
    )

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows a generic message when login fails for another reason', async () => {
    mocks.login.mockRejectedValueOnce(new Error('Server error'))

    const wrapper = mountLogin()

    await fillLoginForm(wrapper)

    await wrapper.find('.login-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.login-error').text()).toBe(
      'No se ha podido iniciar sesión. Inténtalo de nuevo.'
    )

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows loading state while login is in progress', async () => {
    let resolveLogin

    mocks.login.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        })
    )

    const wrapper = mountLogin()

    await fillLoginForm(wrapper)

    await wrapper.find('.login-form').trigger('submit')

    expect(wrapper.find('.submit-login').text()).toBe('Iniciando sesión...')

    expect(wrapper.find('.submit-login').attributes('disabled')).toBeDefined()

    resolveLogin()

    await flushPromises()

    expect(wrapper.find('.submit-login').text()).toBe('Iniciar sesión')

    expect(wrapper.find('.submit-login').attributes('disabled')).toBeUndefined()

    expect(mocks.push).toHaveBeenCalledWith('/')
  })
})
