import { beforeEach, describe, expect, it, vi } from 'vitest'

import { flushPromises, shallowMount } from '@vue/test-utils'

const mocks = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),

  authStore: {
    user: null,
    accessToken: null,
  },
}))

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('../../services/api', () => ({
  default: {
    patch: mocks.patch,
    post: mocks.post,
  },
}))

import AccountView from '../AccountView.vue'

function mountAccount() {
  return shallowMount(AccountView, {
    global: {
      stubs: {
        NavBar: true,
      },
    },
  })
}

beforeEach(() => {
  mocks.patch.mockReset()
  mocks.post.mockReset()

  mocks.authStore.user = {
    id: 1,
    username: 'alex',
    email: 'alex@example.com',
    role: 'CLIENT',
  }

  mocks.authStore.accessToken = 'access-token'
})

describe('AccountView', () => {
  it('loads the current account data', () => {
    const wrapper = mountAccount()

    expect(wrapper.find('#username').element.value).toBe('alex')

    expect(wrapper.find('#email').element.value).toBe('alex@example.com')

    expect(wrapper.find('#username').attributes('disabled')).toBeDefined()

    expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
  })

  it('enables username editing', async () => {
    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    expect(wrapper.find('#username').attributes('disabled')).toBeUndefined()

    expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
  })

  it('enables email editing', async () => {
    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[1].trigger('click')

    expect(wrapper.find('#email').attributes('disabled')).toBeUndefined()

    expect(wrapper.find('#username').attributes('disabled')).toBeDefined()
  })

  it('updates account data and stores the returned user', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {
        id: 1,
        username: 'alex2',
        email: 'new@example.com',
        role: 'CLIENT',
      },
    })

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    await editButtons[1].trigger('click')

    await wrapper.find('#username').setValue('alex2')

    await wrapper.find('#email').setValue('new@example.com')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledTimes(1)

    expect(mocks.patch).toHaveBeenCalledWith(
      '/users/me/',
      {
        username: 'alex2',
        email: 'new@example.com',
      },
      {
        headers: {
          Authorization: 'Bearer access-token',
        },
      }
    )

    expect(mocks.authStore.user).toEqual({
      id: 1,
      username: 'alex2',
      email: 'new@example.com',
      role: 'CLIENT',
    })

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(true)

    expect(wrapper.text()).toContain('Cambios guardados')
  })

  it('does not call the account endpoint when username and email have not changed', async () => {
    const wrapper = mountAccount()

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(mocks.patch).not.toHaveBeenCalled()

    expect(mocks.post).not.toHaveBeenCalled()

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(true)
  })

  it('shows the password fields when password change is enabled', async () => {
    const wrapper = mountAccount()

    expect(wrapper.find('.password-section').exists()).toBe(false)

    await wrapper.find('.change-password-button').trigger('click')

    expect(wrapper.find('.password-section').exists()).toBe(true)

    expect(wrapper.text()).toContain('Cancelar cambio de contraseña')
  })

  it('requires all password fields', async () => {
    const wrapper = mountAccount()

    await wrapper.find('.change-password-button').trigger('click')

    await wrapper.find('#old-password').setValue('old-password')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('Completa todos los campos de contraseña.')

    expect(mocks.post).not.toHaveBeenCalled()

    expect(mocks.patch).not.toHaveBeenCalled()
  })

  it('requires the new passwords to match', async () => {
    const wrapper = mountAccount()

    await wrapper.find('.change-password-button').trigger('click')

    await wrapper.find('#old-password').setValue('old-password')

    await wrapper.find('#new-password').setValue('new-password')

    await wrapper.find('#new-password-confirm').setValue('different-password')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('Las nuevas contraseñas no coinciden.')

    expect(mocks.post).not.toHaveBeenCalled()
  })

  it('changes the password with the entered values', async () => {
    mocks.post.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = mountAccount()

    await wrapper.find('.change-password-button').trigger('click')

    await wrapper.find('#old-password').setValue('old-password')

    await wrapper.find('#new-password').setValue('new-password')

    await wrapper.find('#new-password-confirm').setValue('new-password')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(mocks.post).toHaveBeenCalledTimes(1)

    expect(mocks.post).toHaveBeenCalledWith(
      '/users/change-password/',
      {
        old_password: 'old-password',

        new_password: 'new-password',

        new_password_confirm: 'new-password',
      },
      {
        headers: {
          Authorization: 'Bearer access-token',
        },
      }
    )

    expect(wrapper.find('.password-section').exists()).toBe(false)

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(true)
  })

  it('updates account data and password in the same submission', async () => {
    mocks.patch.mockResolvedValueOnce({
      data: {
        id: 1,
        username: 'alex-new',
        email: 'alex@example.com',
        role: 'CLIENT',
      },
    })

    mocks.post.mockResolvedValueOnce({
      data: {},
    })

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    await wrapper.find('#username').setValue('alex-new')

    await wrapper.find('.change-password-button').trigger('click')

    await wrapper.find('#old-password').setValue('old-password')

    await wrapper.find('#new-password').setValue('new-password')

    await wrapper.find('#new-password-confirm').setValue('new-password')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(mocks.patch).toHaveBeenCalledTimes(1)

    expect(mocks.post).toHaveBeenCalledTimes(1)

    expect(mocks.authStore.user.username).toBe('alex-new')
  })

  it('shows an error when the current password is incorrect', async () => {
    mocks.post.mockRejectedValueOnce({
      response: {
        data: {
          old_password: ['Incorrect password'],
        },
      },
    })

    const wrapper = mountAccount()

    await wrapper.find('.change-password-button').trigger('click')

    await wrapper.find('#old-password').setValue('wrong-password')

    await wrapper.find('#new-password').setValue('new-password')

    await wrapper.find('#new-password-confirm').setValue('new-password')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('La contraseña actual no es correcta.')

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(false)
  })

  it('shows an error when the email is already in use', async () => {
    mocks.patch.mockRejectedValueOnce({
      response: {
        data: {
          email: ['Already exists'],
        },
      },
    })

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[1].trigger('click')

    await wrapper.find('#email').setValue('used@example.com')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('Ese correo electrónico ya está en uso.')
  })

  it('shows an error when the username is already in use', async () => {
    mocks.patch.mockRejectedValueOnce({
      response: {
        data: {
          username: ['Already exists'],
        },
      },
    })

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    await wrapper.find('#username').setValue('existing-user')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('Ese nombre de usuario ya está en uso.')
  })

  it('shows a generic error when saving fails', async () => {
    mocks.patch.mockRejectedValueOnce(new Error('Server error'))

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    await wrapper.find('#username').setValue('alex-new')

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-error').text()).toBe('No se han podido guardar los cambios.')
  })

  it('closes the success message', async () => {
    const wrapper = mountAccount()

    await wrapper.find('.account-form').trigger('submit')

    await flushPromises()

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(true)

    await wrapper.find('.account-popup button').trigger('click')

    expect(wrapper.find('.account-popup-overlay').exists()).toBe(false)
  })

  it('shows loading state while account changes are being saved', async () => {
    let resolvePatch

    mocks.patch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve
        })
    )

    const wrapper = mountAccount()

    const editButtons = wrapper.findAll('.edit-button')

    await editButtons[0].trigger('click')

    await wrapper.find('#username').setValue('alex-new')

    await wrapper.find('.account-form').trigger('submit')

    expect(wrapper.find('.save-account-button').text()).toBe('Guardando...')

    expect(wrapper.find('.save-account-button').attributes('disabled')).toBeDefined()

    resolvePatch({
      data: {
        id: 1,
        username: 'alex-new',
        email: 'alex@example.com',
        role: 'CLIENT',
      },
    })

    await flushPromises()

    expect(wrapper.find('.save-account-button').text()).toBe('Guardar cambios')

    expect(wrapper.find('.save-account-button').attributes('disabled')).toBeUndefined()
  })
})
