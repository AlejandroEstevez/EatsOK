<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AccessBrand from '../components/access/AccessBrand.vue'

import { useAuthStore } from '../stores/auth'

import background from '../assets/access/access-background.png'

import mailIcon from '../assets/icons/mail.svg'
import keyIcon from '../assets/icons/key.svg'
import eyeIcon from '../assets/icons/eye.svg'
import blindIcon from '../assets/icons/blind.svg'

import './LoginView.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value, rememberMe.value)

    router.push('/')
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'El correo electrónico o la contraseña no son correctos.'
    } else {
      error.value = 'No se ha podido iniciar sesión. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page" :style="{ backgroundImage: `url(${background})` }">
    <AccessBrand />

    <section class="login-panel-wrapper">
      <div class="login-panel">
        <header class="login-header">
          <h2>¡Bienvenido de nuevo!</h2>
          <p>Inicia sesión para continuar</p>
        </header>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email"> Correo electrónico </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img :src="mailIcon" alt="" />
              </span>

              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password"> Contraseña </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img :src="keyIcon" alt="" />
              </span>

              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Introduce la contraseña"
                required
              />

              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <img :src="showPassword ? blindIcon : eyeIcon" alt="" />
              </button>
            </div>
          </div>

          <div class="login-options">
            <label class="remember-option">
              <input v-model="rememberMe" type="checkbox" />

              <span>Recordarme</span>
            </label>

            <RouterLink to="/forgot-password" class="forgot-link">
              ¿Has olvidado tu contraseña?
            </RouterLink>
          </div>

          <p v-if="error" class="login-error" role="alert">
            {{ error }}
          </p>

          <button type="submit" class="submit-login" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="login-separator"></div>

        <div class="register-link">
          <span>¿No tienes cuenta?</span>

          <RouterLink to="/register"> Regístrate aquí </RouterLink>
        </div>
      </div>
    </section>

    <p class="login-slogan">Everyone can tag along</p>
  </div>
</template>
