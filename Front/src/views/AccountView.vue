<script setup>
import { ref } from 'vue'

import NavBar from '../components/common/NavBar.vue'

import { useAuthStore } from '../stores/auth'
import api from '../services/api'

import editIcon from '../assets/icons/edit.svg'
import eyeIcon from '../assets/icons/eye.svg'
import blindIcon from '../assets/icons/blind.svg'
import keyIcon from '../assets/icons/key.svg'

import './AccountView.css'

const authStore = useAuthStore()

const username = ref(authStore.user?.username ?? '')
const email = ref(authStore.user?.email ?? '')

const editUsername = ref(false)
const editEmail = ref(false)

const changePassword = ref(false)

const oldPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)

const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)

const saveChanges = async () => {
  error.value = ''
  loading.value = true

  try {
    const accountChanged =
      username.value !== authStore.user.username || email.value !== authStore.user.email

    if (changePassword.value) {
      if (!oldPassword.value || !newPassword.value || !newPasswordConfirm.value) {
        error.value = 'Completa todos los campos de contraseña.'
        return
      }

      if (newPassword.value !== newPasswordConfirm.value) {
        error.value = 'Las nuevas contraseñas no coinciden.'
        return
      }
    }

    if (accountChanged) {
      const response = await api.patch(
        '/users/me/',
        {
          username: username.value,
          email: email.value,
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        }
      )

      authStore.user = response.data
    }

    if (changePassword.value) {
      await api.post(
        '/users/change-password/',
        {
          old_password: oldPassword.value,
          new_password: newPassword.value,
          new_password_confirm: newPasswordConfirm.value,
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        }
      )
    }

    editUsername.value = false
    editEmail.value = false

    changePassword.value = false

    oldPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''

    showSuccess.value = true
  } catch (err) {
    if (err.response?.data?.old_password) {
      error.value = 'La contraseña actual no es correcta.'
    } else if (err.response?.data?.email) {
      error.value = 'Ese correo electrónico ya está en uso.'
    } else if (err.response?.data?.username) {
      error.value = 'Ese nombre de usuario ya está en uso.'
    } else {
      error.value = 'No se han podido guardar los cambios.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="account-page">
    <NavBar />

    <main class="account-content">
      <section class="account-card">
        <header class="account-header">
          <h1>Datos de la cuenta</h1>

          <p>Consulta y actualiza la información asociada a tu cuenta.</p>
        </header>

        <form class="account-form" @submit.prevent="saveChanges">
          <div class="account-field">
            <label for="username"> Nombre de usuario </label>

            <div class="account-input-wrapper" :class="{ editable: editUsername }">
              <input id="username" v-model="username" type="text" :disabled="!editUsername" />

              <button
                type="button"
                class="edit-button"
                aria-label="Editar nombre de usuario"
                @click="editUsername = !editUsername"
              >
                <img :src="editIcon" alt="" />
              </button>
            </div>
          </div>

          <div class="account-field">
            <label for="email"> Correo electrónico </label>

            <div class="account-input-wrapper" :class="{ editable: editEmail }">
              <input id="email" v-model="email" type="email" :disabled="!editEmail" />

              <button
                type="button"
                class="edit-button"
                aria-label="Editar correo electrónico"
                @click="editEmail = !editEmail"
              >
                <img :src="editIcon" alt="" />
              </button>
            </div>
          </div>

          <button
            type="button"
            class="change-password-button"
            @click="changePassword = !changePassword"
          >
            <img :src="keyIcon" alt="" />

            {{ changePassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña' }}
          </button>

          <div v-if="changePassword" class="password-section">
            <div class="account-field">
              <label for="old-password"> Contraseña actual </label>

              <div class="account-input-wrapper editable">
                <input
                  id="old-password"
                  v-model="oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                />

                <button
                  type="button"
                  class="password-toggle"
                  @click="showOldPassword = !showOldPassword"
                >
                  <img :src="showOldPassword ? blindIcon : eyeIcon" alt="" />
                </button>
              </div>
            </div>

            <div class="account-field">
              <label for="new-password"> Nueva contraseña </label>

              <div class="account-input-wrapper editable">
                <input
                  id="new-password"
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                />

                <button
                  type="button"
                  class="password-toggle"
                  @click="showNewPassword = !showNewPassword"
                >
                  <img :src="showNewPassword ? blindIcon : eyeIcon" alt="" />
                </button>
              </div>
            </div>

            <div class="account-field">
              <label for="new-password-confirm"> Confirmar nueva contraseña </label>

              <div class="account-input-wrapper editable">
                <input
                  id="new-password-confirm"
                  v-model="newPasswordConfirm"
                  :type="showNewPasswordConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                />

                <button
                  type="button"
                  class="password-toggle"
                  @click="showNewPasswordConfirm = !showNewPasswordConfirm"
                >
                  <img :src="showNewPasswordConfirm ? blindIcon : eyeIcon" alt="" />
                </button>
              </div>
            </div>
          </div>

          <p v-if="error" class="account-error" role="alert">
            {{ error }}
          </p>

          <button type="submit" class="save-account-button" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      </section>
    </main>

    <div v-if="showSuccess" class="account-popup-overlay">
      <div class="account-popup">
        <h3>Cambios guardados</h3>

        <p>Los datos de tu cuenta se han actualizado correctamente.</p>

        <button type="button" @click="showSuccess = false">Aceptar</button>
      </div>
    </div>
  </div>
</template>
