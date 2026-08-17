import { defineStore } from 'pinia'

import api from '../services/api'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,

    accessToken:
      localStorage.getItem('accessToken')
      || sessionStorage.getItem('accessToken'),

    refreshToken:
      localStorage.getItem('refreshToken')
      || sessionStorage.getItem('refreshToken'),

    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },

  actions: {
    async initialize() {
      if (!this.accessToken) {
        this.initialized = true
        return
      }

      try {
        await this.fetchUser()
      } catch {
        this.clearSession()
      } finally {
        this.initialized = true
      }
    },

    async login(email, password, rememberMe = false) {
      const response = await api.post('/users/login/', {
        email,
        password,
      })

      const { access, refresh } = response.data

      this.setTokens(access, refresh, rememberMe)

      try {
        await this.fetchUser()
      } catch (error) {
        this.clearSession()
        throw error
      }
    },

    async register(name, email, password) {
        await api.post('/users/register/', {
            username: name,
            email,
            password,
        })

        await this.login(email, password, true)
    },

    async fetchUser() {
      const response = await api.get('/users/me/', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      this.user = response.data
    },

    async logout() {
        try {
            if (this.refreshToken && this.accessToken) {
            await api.post(
                '/users/logout/',
                {
                refresh: this.refreshToken,
                },
                {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
                },
            )
            }
        } finally {
            this.clearSession()
        }
    },

    setTokens(access, refresh, rememberMe = false) {
      this.accessToken = access
      this.refreshToken = refresh

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')

      const storage = rememberMe
        ? localStorage
        : sessionStorage

      storage.setItem('accessToken', access)
      storage.setItem('refreshToken', refresh)
    },

    clearSession() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
    },
  },
})
