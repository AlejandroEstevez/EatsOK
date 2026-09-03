<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import './NavBar.css'

import { useAuthStore } from '../../stores/auth'

import UserAvatar from './UserAvatar.vue'

import logo from '../../assets/logo/eatsok-logo-text.png'
import profileIcon from '../../assets/icons/food-profile.svg'
import establishmentsIcon from '../../assets/icons/establishments.svg'
import recipesIcon from '../../assets/icons/recipes.svg'


const authStore = useAuthStore()
const router = useRouter()

const showAccountMenu = ref(false)
const showLogoutMessage = ref(false)


const handleLogout = async () => {
  await authStore.logout()

  showAccountMenu.value = false
  showLogoutMessage.value = true

  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <RouterLink
      to="/"
      class="navbar-logo"
      aria-label="Ir a la página principal"
    >
      <img
        :src="logo"
        alt="EatsOK"
      />
    </RouterLink>

    <nav class="navbar-navigation">
      <RouterLink
        to="/profile"
        class="navbar-link"
      >
        <img
          :src="profileIcon"
          alt=""
          class="navbar-icon"
        />

        <span>
          Perfil alimentario
        </span>
      </RouterLink>

      <RouterLink
        to="/establishments"
        class="navbar-link"
      >
        <img
          :src="establishmentsIcon"
          alt=""
          class="navbar-icon"
        />

        <span>
          Establecimientos
        </span>
      </RouterLink>

      <RouterLink
        to="/recipes"
        class="navbar-link"
      >
        <img
          :src="recipesIcon"
          alt=""
          class="navbar-icon"
        />

        <span>
          Recetas
        </span>
      </RouterLink>
    </nav>

    <div class="navbar-user">
      <div
        v-if="authStore.isAuthenticated"
        class="account-menu-container"
      >
        <button
          type="button"
          class="navbar-account"
          @click="showAccountMenu = !showAccountMenu"
        >
          <UserAvatar :size="58" />

          <span>
            {{ authStore.user.username }}
          </span>

          <span
            class="account-arrow"
            :class="{ open: showAccountMenu }"
          >
            ▾
          </span>
        </button>

        <div
          v-if="showAccountMenu"
          class="account-dropdown"
        >
          <RouterLink
            to="/account"
            class="account-dropdown-item"
            @click="showAccountMenu = false"
          >
            Editar datos
          </RouterLink>

          <RouterLink
            v-if="authStore.user.role === 'ADMIN'"
            to="/admin/owners/register"
            class="account-dropdown-item"
            @click="showAccountMenu = false"
          >
            Registrar propietario
          </RouterLink>

          <RouterLink
            v-if="authStore.user.role === 'OWNER'"
            to="/owner/establishments"
            class="account-dropdown-item"
            @click="showAccountMenu = false"
          >
            Gestionar establecimientos
          </RouterLink>

          <button
            type="button"
            class="account-dropdown-item logout-item"
            @click="handleLogout"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <RouterLink
        v-else
        to="/login"
        class="login-button"
      >
        Acceder
      </RouterLink>
    </div>

    <div
      v-if="showLogoutMessage"
      class="logout-message-overlay"
    >
      <div class="logout-message">
        <h3>
          Sesión cerrada
        </h3>

        <p>
          Has cerrado sesión correctamente.
        </p>

        <button
          type="button"
          @click="showLogoutMessage = false"
        >
          Aceptar
        </button>
      </div>
    </div>
  </header>
</template>
