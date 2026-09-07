import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  register: vi.fn(),

  authStore: {
    register: null,
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

import RegisterView from '../RegisterView.vue'

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

function mountRegister() {
  return shallowMount(RegisterView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        AccessBrand: true,
      },
    },
  })
}

async function fillRegisterForm(
  wrapper,
  {
    name = 'alex',
    email = 'alex@example.com',
    password = 'password123',
    passwordConfirm = 'password123',
    acceptTerms = true,
  } = {}
) {
  await wrapper.find('#name').setValue(name)

  await wrapper.find('#email').setValue(email)

  await wrapper.find('#password').setValue(password)

  await wrapper.find('#password-confirm').setValue(passwordConfirm)

  if (acceptTerms) {
    await wrapper.find('.terms-option input').setValue(true)
  }
}

beforeEach(() => {
  mocks.push.mockReset()
  mocks.register.mockReset()

  mocks.register.mockResolvedValue()

  mocks.authStore.register = mocks.register
})

describe('RegisterView', () => {
  it('renders the registration form', () => {
    const wrapper = mountRegister()

    expect(wrapper.text()).toContain('¡Crea tu cuenta!')

    expect(wrapper.find('#name').exists()).toBe(true)

    expect(wrapper.find('#email').exists()).toBe(true)

    expect(wrapper.find('#password').exists()).toBe(true)

    expect(wrapper.find('#password-confirm').exists()).toBe(true)

    expect(wrapper.find('.submit-register').text()).toBe('Crear cuenta')
  })

  it('uses password type for both password fields by default', () => {
    const wrapper = mountRegister()

    expect(wrapper.find('#password').attributes('type')).toBe('password')

    expect(wrapper.find('#password-confirm').attributes('type')).toBe('password')
  })

  it('toggles the main password visibility', async () => {
    const wrapper = mountRegister()

    const toggles = wrapper.findAll('.password-toggle')

    await toggles[0].trigger('click')

    expect(wrapper.find('#password').attributes('type')).toBe('text')

    expect(wrapper.find('#password-confirm').attributes('type')).toBe('password')

    await toggles[0].trigger('click')

    expect(wrapper.find('#password').attributes('type')).toBe('password')
  })

  it('toggles the confirmation password visibility independently', async () => {
    const wrapper = mountRegister()

    const toggles = wrapper.findAll('.password-toggle')

    await toggles[1].trigger('click')

    expect(wrapper.find('#password-confirm').attributes('type')).toBe('text')

    expect(wrapper.find('#password').attributes('type')).toBe('password')
  })

  it('does not register when passwords do not match', async () => {
    const wrapper = mountRegister()

    await fillRegisterForm(wrapper, {
      password: 'password123',

      passwordConfirm: 'different-password',
    })

    await wrapper.find('.register-form').trigger('submit')

    await flushPromises()

    expect(mocks.register).not.toHaveBeenCalled()

    expect(wrapper.find('.register-error').text()).toBe('Las contraseñas no coinciden.')

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('does not register when terms are not accepted', async () => {
    const wrapper = mountRegister()

    await fillRegisterForm(wrapper, {
      acceptTerms: false,
    })

    await wrapper.find('.register-form').trigger('submit')

    await flushPromises()

    expect(mocks.register).not.toHaveBeenCalled()

    expect(wrapper.find('.register-error').text()).toBe(
      'Debes aceptar la Política de privacidad y los Términos y condiciones.'
    )
  })

  it('registers the user and redirects home', async () => {
    const wrapper = mountRegister()

    await fillRegisterForm(wrapper)

    await wrapper.find('.register-form').trigger('submit')

    await flushPromises()

    expect(mocks.register).toHaveBeenCalledTimes(1)

    expect(mocks.register).toHaveBeenCalledWith('alex', 'alex@example.com', 'password123')

    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('shows a validation message when the API rejects the registration data', async () => {
    mocks.register.mockRejectedValueOnce({
      response: {
        data: {
          email: ['Already exists'],
        },
      },
    })

    const wrapper = mountRegister()

    await fillRegisterForm(wrapper)

    await wrapper.find('.register-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.register-error').text()).toBe(
      'No se ha podido crear la cuenta. Revisa los datos introducidos.'
    )

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows a generic message when registration fails without API validation data', async () => {
    mocks.register.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mountRegister()

    await fillRegisterForm(wrapper)

    await wrapper.find('.register-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.register-error').text()).toBe(
      'No se ha podido crear la cuenta. Inténtalo de nuevo.'
    )

    expect(mocks.push).not.toHaveBeenCalled()
  })

  it('shows the loading state while registration is in progress', async () => {
    let resolveRegister

    mocks.register.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve
        })
    )

    const wrapper = mountRegister()

    await fillRegisterForm(wrapper)

    await wrapper.find('.register-form').trigger('submit')

    expect(wrapper.find('.submit-register').text()).toBe('Creando cuenta...')

    expect(wrapper.find('.submit-register').attributes('disabled')).toBeDefined()

    resolveRegister()

    await flushPromises()

    expect(wrapper.find('.submit-register').text()).toBe('Crear cuenta')

    expect(wrapper.find('.submit-register').attributes('disabled')).toBeUndefined()

    expect(mocks.push).toHaveBeenCalledWith('/')
  })
})
