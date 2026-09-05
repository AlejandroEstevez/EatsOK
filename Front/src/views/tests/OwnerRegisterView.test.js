import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  flushPromises,
  shallowMount,
} from '@vue/test-utils'


const mocks = vi.hoisted(() => ({
  post: vi.fn(),

  authStore: {
    accessToken: null,
  },
}))


vi.mock('../../stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))


vi.mock('../../services/api', () => ({
  default: {
    post: mocks.post,
  },
}))


import OwnerRegisterView from '../OwnerRegisterView.vue'


function mountOwnerRegister() {
  return shallowMount(
    OwnerRegisterView,
    {
      global: {
        stubs: {
          NavBar: true,
        },
      },
    }
  )
}


async function fillOwnerForm(
  wrapper,
  {
    username = 'restaurant-owner',
    email = 'owner@example.com',
    password = 'password123',
  } = {}
) {
  await wrapper
    .find('#owner-username')
    .setValue(username)

  await wrapper
    .find('#owner-email')
    .setValue(email)

  await wrapper
    .find('#owner-password')
    .setValue(password)
}


beforeEach(() => {
  mocks.post.mockReset()

  mocks.authStore.accessToken =
    'admin-access-token'
})


describe('OwnerRegisterView', () => {
  it(
    'renders the owner registration form',
    () => {
      const wrapper =
        mountOwnerRegister()

      expect(
        wrapper.text()
      ).toContain(
        'Registrar propietario'
      )

      expect(
        wrapper
          .find('#owner-username')
          .exists()
      ).toBe(true)

      expect(
        wrapper
          .find('#owner-email')
          .exists()
      ).toBe(true)

      expect(
        wrapper
          .find('#owner-password')
          .exists()
      ).toBe(true)

      expect(
        wrapper.text()
      ).toContain(
        'La cuenta se registrará automáticamente con permisos de propietario.'
      )
    }
  )


  it(
    'uses password type by default',
    () => {
      const wrapper =
        mountOwnerRegister()

      expect(
        wrapper
          .find('#owner-password')
          .attributes('type')
      ).toBe(
        'password'
      )
    }
  )


  it(
    'toggles password visibility',
    async () => {
      const wrapper =
        mountOwnerRegister()

      await wrapper
        .find(
          '.owner-password-toggle'
        )
        .trigger('click')

      expect(
        wrapper
          .find('#owner-password')
          .attributes('type')
      ).toBe(
        'text'
      )

      await wrapper
        .find(
          '.owner-password-toggle'
        )
        .trigger('click')

      expect(
        wrapper
          .find('#owner-password')
          .attributes('type')
      ).toBe(
        'password'
      )
    }
  )


  it(
    'requires all fields before sending the request',
    async () => {
      const wrapper =
        mountOwnerRegister()

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        mocks.post
      ).not.toHaveBeenCalled()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'Completa todos los campos.'
      )
    }
  )


  it(
    'registers an owner with the authenticated admin token',
    async () => {
      mocks.post.mockResolvedValueOnce({
        data: {
          id: 2,
          username:
            'restaurant-owner',
          email:
            'owner@example.com',
          role: 'OWNER',
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        mocks.post
      ).toHaveBeenCalledTimes(1)

      expect(
        mocks.post
      ).toHaveBeenCalledWith(
        '/users/owners/',
        {
          username:
            'restaurant-owner',

          email:
            'owner@example.com',

          password:
            'password123',
        },
        {
          headers: {
            Authorization:
              'Bearer admin-access-token',
          },
        }
      )
    }
  )


  it(
    'trims username and email before registration',
    async () => {
      mocks.post.mockResolvedValueOnce({
        data: {},
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper,
        {
          username:
            '  restaurant-owner  ',

          email:
            '  owner@example.com  ',
        }
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        mocks.post
      ).toHaveBeenCalledWith(
        '/users/owners/',
        {
          username:
            'restaurant-owner',

          email:
            'owner@example.com',

          password:
            'password123',
        },
        {
          headers: {
            Authorization:
              'Bearer admin-access-token',
          },
        }
      )
    }
  )


  it(
    'clears the form and shows success after registration',
    async () => {
      mocks.post.mockResolvedValueOnce({
        data: {},
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find('#owner-username')
          .element.value
      ).toBe('')

      expect(
        wrapper
          .find('#owner-email')
          .element.value
      ).toBe('')

      expect(
        wrapper
          .find('#owner-password')
          .element.value
      ).toBe('')

      expect(
        wrapper
          .find('#owner-password')
          .attributes('type')
      ).toBe(
        'password'
      )

      expect(
        wrapper.find(
          '.owner-register-popup-overlay'
        ).exists()
      ).toBe(true)

      expect(
        wrapper.text()
      ).toContain(
        'Propietario registrado'
      )
    }
  )


  it(
    'shows an error when the email is already in use',
    async () => {
      mocks.post.mockRejectedValueOnce({
        response: {
          data: {
            email: [
              'Already exists',
            ],
          },
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'Ese correo electrónico ya está en uso.'
      )

      expect(
        wrapper.find(
          '.owner-register-popup-overlay'
        ).exists()
      ).toBe(false)
    }
  )


  it(
    'shows an error when the username is already in use',
    async () => {
      mocks.post.mockRejectedValueOnce({
        response: {
          data: {
            username: [
              'Already exists',
            ],
          },
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'Ese nombre de usuario ya está en uso.'
      )
    }
  )


  it(
    'shows the first password validation error returned by the API',
    async () => {
      mocks.post.mockRejectedValueOnce({
        response: {
          data: {
            password: [
              'La contraseña es demasiado corta.',
              'Otro error.',
            ],
          },
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'La contraseña es demasiado corta.'
      )
    }
  )


  it(
    'shows a string password validation error returned by the API',
    async () => {
      mocks.post.mockRejectedValueOnce({
        response: {
          data: {
            password:
              'Contraseña no válida.',
          },
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'Contraseña no válida.'
      )
    }
  )


  it(
    'shows a permissions error for a 403 response',
    async () => {
      mocks.post.mockRejectedValueOnce({
        response: {
          status: 403,
        },
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'No tienes permisos para registrar propietarios.'
      )
    }
  )


  it(
    'shows a generic error when registration fails',
    async () => {
      mocks.post.mockRejectedValueOnce(
        new Error(
          'Server error'
        )
      )

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper
          .find(
            '.owner-register-error'
          )
          .text()
      ).toBe(
        'No se ha podido registrar el propietario.'
      )
    }
  )


  it(
    'shows loading state while the owner is being registered',
    async () => {
      let resolvePost

      mocks.post.mockImplementationOnce(
        () => new Promise(resolve => {
          resolvePost = resolve
        })
      )

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      expect(
        wrapper
          .find(
            '.register-owner-button'
          )
          .text()
      ).toBe(
        'Registrando...'
      )

      expect(
        wrapper
          .find(
            '.register-owner-button'
          )
          .attributes('disabled')
      ).toBeDefined()

      resolvePost({
        data: {},
      })

      await flushPromises()

      expect(
        wrapper
          .find(
            '.register-owner-button'
          )
          .text()
      ).toBe(
        'Registrar propietario'
      )

      expect(
        wrapper
          .find(
            '.register-owner-button'
          )
          .attributes('disabled')
      ).toBeUndefined()
    }
  )


  it(
    'closes the success message',
    async () => {
      mocks.post.mockResolvedValueOnce({
        data: {},
      })

      const wrapper =
        mountOwnerRegister()

      await fillOwnerForm(
        wrapper
      )

      await wrapper
        .find(
          '.owner-register-form'
        )
        .trigger('submit')

      await flushPromises()

      expect(
        wrapper.find(
          '.owner-register-popup-overlay'
        ).exists()
      ).toBe(true)

      await wrapper
        .find(
          '.owner-register-popup button'
        )
        .trigger('click')

      expect(
        wrapper.find(
          '.owner-register-popup-overlay'
        ).exists()
      ).toBe(false)
    }
  )
})
