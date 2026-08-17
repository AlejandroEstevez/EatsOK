<script setup>
import './AccessBrand.css'

import logo from '../../assets/logo/eatsok-logo-text-gray.png'
import eatsokFood from '../../assets/logo/eatsok-food.png'

import profileIcon from '../../assets/icons/food-profile.svg'
import communityIcon from '../../assets/icons/community.svg'
import recipesIcon from '../../assets/icons/recipes.svg'
</script>

<template>
  <section class="access-brand">
    <RouterLink
      to="/"
      class="access-logo-link"
    >
      <img
        :src="logo"
        alt="EatsOK"
        class="access-logo"
      />
    </RouterLink>

    <div class="access-message">
      <h1>
        Encuentra opciones<br />
        aptas para ti
      </h1>

      <div class="access-features">
        <div class="access-feature">
          <div class="access-feature-icon">
            <img
              :src="profileIcon"
              alt=""
            />
          </div>

          <div class="access-feature-content">
            <h3>Personalizado</h3>

            <p>
              Filtra según tus alergias, intolerancias
              y preferencias.
            </p>
          </div>
        </div>

        <div class="access-feature">
          <div class="access-feature-icon">
            <img
              :src="communityIcon"
              alt=""
            />
          </div>

          <div class="access-feature-content">
            <h3>Comunidad</h3>

            <p>
              Descubre valoraciones y comparte
              tus experiencias.
            </p>
          </div>
        </div>

        <div class="access-feature">
          <div class="access-feature-icon">
            <img
              :src="recipesIcon"
              alt=""
            />
          </div>

          <div class="access-feature-content">
            <h3>Recetas adaptadas</h3>

            <p>
              Encuentra y guarda recetas deliciosas
              y seguras para ti.
            </p>
          </div>
        </div>
      </div>
    </div>

    <img
      :src="eatsokFood"
      alt=""
      class="access-food"
    />
  </section>
</template>
