<script setup>
import './NavBar.css'

import UserAvatar from './UserAvatar.vue'

import logo from '../../assets/logo/eatsok-logo-text.png'
import profileIcon from '../../assets/icons/food-profile.svg'
import establishmentsIcon from '../../assets/icons/establishments.svg'
import recipesIcon from '../../assets/icons/recipes.svg'
import accountIcon from '../../assets/icons/account.svg'
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

    <RouterLink
      to="/account"
      class="navbar-account"
    >
      <UserAvatar :size="58" />

      <span>
        Cuenta
      </span>

      <span class="account-arrow">
        ▾
      </span>
    </RouterLink>
  </header>
</template>
