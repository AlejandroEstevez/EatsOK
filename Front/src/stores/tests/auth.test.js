import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  default: apiMock,
}))

import { useAuthStore } from '../auth'

const user = {
  id: 1,
  username: 'alex',
  email: 'alex@example.com',
  role: 'CLIENT',
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()

  vi.clearAllMocks()

  setActivePinia(createPinia())
})

describe('auth store', () => {
  describe('initialize', () => {
    it('finishes initialization without requesting the user when there is no access token', async () => {
      const store = useAuthStore()

      await store.initialize()

      expect(apiMock.get).not.toHaveBeenCalled()

      expect(store.initialized).toBe(true)

      expect(store.user).toBeNull()
    })

    it('fetches the authenticated user when an access token exists', async () => {
      localStorage.setItem('accessToken', 'access-token')

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.initialize()

      expect(apiMock.get).toHaveBeenCalledWith('/users/me/', {
        headers: {
          Authorization: 'Bearer access-token',
        },
      })

      expect(store.user).toEqual(user)

      expect(store.initialized).toBe(true)

      expect(store.isAuthenticated).toBe(true)
    })

    it('clears the session when fetching the user fails during initialization', async () => {
      localStorage.setItem('accessToken', 'invalid-access')

      localStorage.setItem('refreshToken', 'invalid-refresh')

      apiMock.get.mockRejectedValueOnce(new Error('Unauthorized'))

      const store = useAuthStore()

      await store.initialize()

      expect(store.user).toBeNull()

      expect(store.accessToken).toBeNull()

      expect(store.refreshToken).toBeNull()

      expect(localStorage.getItem('accessToken')).toBeNull()

      expect(localStorage.getItem('refreshToken')).toBeNull()

      expect(store.initialized).toBe(true)
    })
  })

  describe('login', () => {
    it('logs in and fetches the authenticated user', async () => {
      apiMock.post.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      })

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.login('alex@example.com', 'password123')

      expect(apiMock.post).toHaveBeenCalledWith('/users/login/', {
        email: 'alex@example.com',
        password: 'password123',
      })

      expect(apiMock.get).toHaveBeenCalledWith('/users/me/', {
        headers: {
          Authorization: 'Bearer access-token',
        },
      })

      expect(store.accessToken).toBe('access-token')

      expect(store.refreshToken).toBe('refresh-token')

      expect(store.user).toEqual(user)

      expect(store.isAuthenticated).toBe(true)
    })

    it('stores login tokens in sessionStorage by default', async () => {
      apiMock.post.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      })

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.login('alex@example.com', 'password123')

      expect(sessionStorage.getItem('accessToken')).toBe('access-token')

      expect(sessionStorage.getItem('refreshToken')).toBe('refresh-token')

      expect(localStorage.getItem('accessToken')).toBeNull()

      expect(localStorage.getItem('refreshToken')).toBeNull()
    })

    it('stores login tokens in localStorage when rememberMe is enabled', async () => {
      apiMock.post.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      })

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.login('alex@example.com', 'password123', true)

      expect(localStorage.getItem('accessToken')).toBe('access-token')

      expect(localStorage.getItem('refreshToken')).toBe('refresh-token')

      expect(sessionStorage.getItem('accessToken')).toBeNull()

      expect(sessionStorage.getItem('refreshToken')).toBeNull()
    })

    it('clears the session when fetching the user fails after login', async () => {
      apiMock.post.mockResolvedValueOnce({
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      })

      apiMock.get.mockRejectedValueOnce(new Error('Unable to fetch user'))

      const store = useAuthStore()

      await expect(store.login('alex@example.com', 'password123')).rejects.toThrow(
        'Unable to fetch user'
      )

      expect(store.user).toBeNull()

      expect(store.accessToken).toBeNull()

      expect(store.refreshToken).toBeNull()

      expect(sessionStorage.getItem('accessToken')).toBeNull()

      expect(sessionStorage.getItem('refreshToken')).toBeNull()
    })
  })

  describe('register', () => {
    it('registers the user and logs in afterwards', async () => {
      apiMock.post
        .mockResolvedValueOnce({
          data: {
            id: 1,
          },
        })
        .mockResolvedValueOnce({
          data: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        })

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.register('alex', 'alex@example.com', 'password123')

      expect(apiMock.post).toHaveBeenNthCalledWith(1, '/users/register/', {
        username: 'alex',
        email: 'alex@example.com',
        password: 'password123',
      })

      expect(apiMock.post).toHaveBeenNthCalledWith(2, '/users/login/', {
        email: 'alex@example.com',
        password: 'password123',
      })

      expect(apiMock.get).toHaveBeenCalledWith('/users/me/', {
        headers: {
          Authorization: 'Bearer access-token',
        },
      })

      expect(store.user).toEqual(user)

      expect(store.isAuthenticated).toBe(true)
    })

    it('keeps registered user tokens in localStorage', async () => {
      apiMock.post
        .mockResolvedValueOnce({
          data: {
            id: 1,
          },
        })
        .mockResolvedValueOnce({
          data: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        })

      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      await store.register('alex', 'alex@example.com', 'password123')

      expect(localStorage.getItem('accessToken')).toBe('access-token')

      expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    })
  })

  describe('fetchUser', () => {
    it('stores the user returned by the API', async () => {
      apiMock.get.mockResolvedValueOnce({
        data: user,
      })

      const store = useAuthStore()

      store.accessToken = 'access-token'

      await store.fetchUser()

      expect(apiMock.get).toHaveBeenCalledWith('/users/me/', {
        headers: {
          Authorization: 'Bearer access-token',
        },
      })

      expect(store.user).toEqual(user)
    })
  })

  describe('logout', () => {
    it('sends the refresh token and clears the session', async () => {
      apiMock.post.mockResolvedValueOnce({
        data: {},
      })

      const store = useAuthStore()

      store.user = user
      store.accessToken = 'access-token'
      store.refreshToken = 'refresh-token'

      localStorage.setItem('accessToken', 'access-token')

      localStorage.setItem('refreshToken', 'refresh-token')

      await store.logout()

      expect(apiMock.post).toHaveBeenCalledWith(
        '/users/logout/',
        {
          refresh: 'refresh-token',
        },
        {
          headers: {
            Authorization: 'Bearer access-token',
          },
        }
      )

      expect(store.user).toBeNull()

      expect(store.accessToken).toBeNull()

      expect(store.refreshToken).toBeNull()

      expect(store.isAuthenticated).toBe(false)
    })

    it('clears the local session even when logout request fails', async () => {
      apiMock.post.mockRejectedValueOnce(new Error('Server error'))

      const store = useAuthStore()

      store.user = user
      store.accessToken = 'access-token'
      store.refreshToken = 'refresh-token'

      sessionStorage.setItem('accessToken', 'access-token')

      sessionStorage.setItem('refreshToken', 'refresh-token')

      await expect(store.logout()).rejects.toThrow('Server error')

      expect(store.user).toBeNull()

      expect(store.accessToken).toBeNull()

      expect(store.refreshToken).toBeNull()

      expect(sessionStorage.getItem('accessToken')).toBeNull()

      expect(sessionStorage.getItem('refreshToken')).toBeNull()
    })

    it('does not call the logout endpoint when there are no tokens', async () => {
      const store = useAuthStore()

      store.user = user

      await store.logout()

      expect(apiMock.post).not.toHaveBeenCalled()

      expect(store.user).toBeNull()

      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('token management', () => {
    it('setTokens uses sessionStorage when rememberMe is false', () => {
      localStorage.setItem('accessToken', 'old-access')

      localStorage.setItem('refreshToken', 'old-refresh')

      const store = useAuthStore()

      store.setTokens('new-access', 'new-refresh')

      expect(store.accessToken).toBe('new-access')

      expect(store.refreshToken).toBe('new-refresh')

      expect(sessionStorage.getItem('accessToken')).toBe('new-access')

      expect(sessionStorage.getItem('refreshToken')).toBe('new-refresh')

      expect(localStorage.getItem('accessToken')).toBeNull()

      expect(localStorage.getItem('refreshToken')).toBeNull()
    })

    it('setTokens uses localStorage when rememberMe is true', () => {
      sessionStorage.setItem('accessToken', 'old-access')

      sessionStorage.setItem('refreshToken', 'old-refresh')

      const store = useAuthStore()

      store.setTokens('new-access', 'new-refresh', true)

      expect(localStorage.getItem('accessToken')).toBe('new-access')

      expect(localStorage.getItem('refreshToken')).toBe('new-refresh')

      expect(sessionStorage.getItem('accessToken')).toBeNull()

      expect(sessionStorage.getItem('refreshToken')).toBeNull()
    })

    it('clearSession removes user and tokens from both storages', () => {
      localStorage.setItem('accessToken', 'local-access')

      localStorage.setItem('refreshToken', 'local-refresh')

      sessionStorage.setItem('accessToken', 'session-access')

      sessionStorage.setItem('refreshToken', 'session-refresh')

      const store = useAuthStore()

      store.user = user
      store.accessToken = 'access-token'
      store.refreshToken = 'refresh-token'

      store.clearSession()

      expect(store.user).toBeNull()

      expect(store.accessToken).toBeNull()

      expect(store.refreshToken).toBeNull()

      expect(localStorage.getItem('accessToken')).toBeNull()

      expect(localStorage.getItem('refreshToken')).toBeNull()

      expect(sessionStorage.getItem('accessToken')).toBeNull()

      expect(sessionStorage.getItem('refreshToken')).toBeNull()
    })
  })
})
