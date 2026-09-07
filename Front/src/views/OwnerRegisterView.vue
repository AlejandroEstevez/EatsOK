<script setup>
import { ref } from 'vue'

import NavBar from '../components/common/NavBar.vue'

import { useAuthStore } from '../stores/auth'
import api from '../services/api'

import eyeIcon from '../assets/icons/eye.svg'
import blindIcon from '../assets/icons/blind.svg'

import './OwnerRegisterView.css'

const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')

const showPassword = ref(false)

const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)

const registerOwner = async () => {
  error.value = ''

  if (!username.value.trim() || !email.value.trim() || !password.value) {
    error.value = 'Completa todos los campos.'

    return
  }

  loading.value = true

  try {
    await api.post(
      '/users/owners/',
      {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      }
    )

    username.value = ''
    email.value = ''
    password.value = ''
    showPassword.value = false

    showSuccess.value = true
  } catch (err) {
    if (err.response?.data?.email) {
      error.value = 'Ese correo electrónico ya está en uso.'
    } else if (err.response?.data?.username) {
      error.value = 'Ese nombre de usuario ya está en uso.'
    } else if (err.response?.data?.password) {
      const passwordError = err.response.data.password

      error.value = Array.isArray(passwordError) ? passwordError[0] : passwordError
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permisos para registrar propietarios.'
    } else {
      error.value = 'No se ha podido registrar el propietario.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="owner-register-page">
    <NavBar />

    <main class="owner-register-content">
      <section class="owner-register-card">
        <header class="owner-register-header">
          <h1>Registrar propietario</h1>

          <p>Crea una cuenta para un propietario de establecimientos.</p>
        </header>

        <form class="owner-register-form" @submit.prevent="registerOwner">
          <div class="owner-register-field">
            <label for="owner-username"> Nombre de usuario </label>

            <div class="owner-register-input-wrapper">
              <input
                id="owner-username"
                v-model="username"
                type="text"
                autocomplete="off"
                placeholder="Nombre de usuario"
              />
            </div>
          </div>

          <div class="owner-register-field">
            <label for="owner-email"> Correo electrónico </label>

            <div class="owner-register-input-wrapper">
              <input
                id="owner-email"
                v-model="email"
                type="email"
                autocomplete="off"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div class="owner-register-field">
            <label for="owner-password"> Contraseña </label>

            <div class="owner-register-input-wrapper">
              <input
                id="owner-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Contraseña"
              />

              <button
                type="button"
                class="owner-password-toggle"
                aria-label="Mostrar u ocultar contraseña"
                @click="showPassword = !showPassword"
              >
                <img :src="showPassword ? blindIcon : eyeIcon" alt="" />
              </button>
            </div>
          </div>

          <div class="owner-register-info">
            <strong> Cuenta de propietario </strong>

            <p>La cuenta se registrará automáticamente con permisos de propietario.</p>
          </div>

          <p v-if="error" class="owner-register-error" role="alert">
            {{ error }}
          </p>

          <button type="submit" class="register-owner-button" :disabled="loading">
            {{ loading ? 'Registrando...' : 'Registrar propietario' }}
          </button>
        </form>
      </section>
    </main>

    <div v-if="showSuccess" class="owner-register-popup-overlay">
      <div class="owner-register-popup">
        <h3>Propietario registrado</h3>

        <p>La cuenta de propietario se ha creado correctamente.</p>

        <button type="button" @click="showSuccess = false">Aceptar</button>
      </div>
    </div>
  </div>
</template>
