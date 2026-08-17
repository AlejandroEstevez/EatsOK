<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AccessBrand from '../components/access/AccessBrand.vue'

import { useAuthStore } from '../stores/auth'

import background from '../assets/access/access-background.png'

import userIcon from '../assets/icons/user.svg'
import mailIcon from '../assets/icons/mail.svg'
import keyIcon from '../assets/icons/key.svg'
import eyeIcon from '../assets/icons/eye.svg'
import blindIcon from '../assets/icons/blind.svg'

import './RegisterView.css'


const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const acceptTerms = ref(false)

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const loading = ref(false)
const error = ref('')


const handleRegister = async () => {
  error.value = ''

  if (password.value !== passwordConfirm.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  if (!acceptTerms.value) {
    error.value = 'Debes aceptar la Política de privacidad y los Términos y condiciones.'
    return
  }

  loading.value = true

  try {
    await authStore.register(
      name.value,
      email.value,
      password.value,
    )

    router.push('/')
  } catch (err) {
    if (err.response?.data) {
      error.value = 'No se ha podido crear la cuenta. Revisa los datos introducidos.'
    } else {
      error.value = 'No se ha podido crear la cuenta. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="register-page"
    :style="{ backgroundImage: `url(${background})` }"
  >
    <AccessBrand />

    <section class="register-panel-wrapper">
      <div class="register-panel">
        <header class="register-header">
          <h2>¡Crea tu cuenta!</h2>

          <p>
            Únete a EatsOK y empieza a disfrutar<br />
            de opciones aptas para ti
          </p>
        </header>

        <form
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <div class="form-group">
            <label for="name">
              Nombre
            </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img
                  :src="userIcon"
                  alt=""
                />
              </span>

              <input
                id="name"
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Nombre"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">
              Correo electrónico
            </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img
                  :src="mailIcon"
                  alt=""
                />
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
            <label for="password">
              Contraseña
            </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img
                  :src="keyIcon"
                  alt=""
                />
              </span>

              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Crea la contraseña"
                required
              />

              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <img
                  :src="showPassword ? blindIcon : eyeIcon"
                  alt=""
                />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="password-confirm">
              Confirmar contraseña
            </label>

            <div class="input-wrapper">
              <span class="input-icon">
                <img
                  :src="keyIcon"
                  alt=""
                />
              </span>

              <input
                id="password-confirm"
                v-model="passwordConfirm"
                :type="showPasswordConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Repite la contraseña"
                required
              />

              <button
                type="button"
                class="password-toggle"
                :aria-label="
                  showPasswordConfirm
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                "
                @click="showPasswordConfirm = !showPasswordConfirm"
              >
                <img
                  :src="showPasswordConfirm ? blindIcon : eyeIcon"
                  alt=""
                />
              </button>
            </div>
          </div>

          <label class="terms-option">
            <input
              v-model="acceptTerms"
              type="checkbox"
            />

            <span>
              Acepto la
              <RouterLink to="/privacy">
                Política de privacidad
              </RouterLink>
              y los
              <RouterLink to="/terms">
                Términos y condiciones
              </RouterLink>
            </span>
          </label>

          <p
            v-if="error"
            class="register-error"
            role="alert"
          >
            {{ error }}
          </p>

          <button
            type="submit"
            class="submit-register"
            :disabled="loading"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="register-separator"></div>

        <div class="login-link">
          <span>¿Ya tienes cuenta?</span>

          <RouterLink to="/login">
            Inicia sesión
          </RouterLink>
        </div>
      </div>
    </section>

    <p class="register-slogan">
      Everyone can tag along
    </p>
  </div>
</template>
