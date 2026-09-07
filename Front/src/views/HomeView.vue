<script setup>
import Navbar from '../components/common/NavBar.vue'
import ExploreCard from '../components/home/ExploreCard.vue'

import background from '../assets/home/home-background.png'

import profileIcon from '../assets/icons/food-profile.svg'
import establishmentsIcon from '../assets/icons/establishments.svg'
import recipesIcon from '../assets/icons/recipes.svg'

import eatsokTag from '../assets/logo/eatsok-tag.png'
import eatsokFood from '../assets/logo/eatsok-food.png'

import './HomeView.css'
</script>

<template>
  <div class="home-page" :style="{ backgroundImage: `url(${background})` }">
    <Navbar />

    <main>
      <section class="hero">
        <div class="hero-content">
          <h1>
            Encuentra opciones<br />
            aptas para ti
          </h1>

          <p class="hero-description">
            Restaurantes, platos y recetas adaptadas a tus alergias, intolerancias y preferencias
            alimentarias
          </p>

          <form class="search-bar" @submit.prevent>
            <span class="search-icon">⌕</span>

            <input type="text" placeholder="Buscar restaurantes, recetas, platos..." />

            <button type="submit">Buscar</button>
          </form>
        </div>

        <div class="hero-food-container">
          <img :src="eatsokFood" alt="" class="hero-food" />
        </div>
      </section>

      <section class="explore-section">
        <h2>Explora EatsOK</h2>

        <div class="cards-grid">
          <ExploreCard
            title="Perfil alimentario"
            description="Indica tus alergias, intolerancias y preferencias para adaptar EatsOK a tus necesidades."
            button-text="Configurar perfil"
            :icon="profileIcon"
            variant="orange"
          />

          <ExploreCard
            title="Mapa de establecimientos"
            description="Encuentra lugares compatibles contigo y consulta sus opciones antes de ir."
            button-text="Explorar mapa"
            :icon="establishmentsIcon"
            variant="green"
          />

          <ExploreCard
            title="Recetas adaptadas"
            description="Descubre recetas compatibles con tu perfil y encuentra nuevas ideas para cocinar."
            button-text="Explorar recetas"
            :icon="recipesIcon"
            variant="yellow"
          />
        </div>

        <div class="owner-banner">
          <div class="owner-info">
            <img :src="eatsokTag" alt="" class="owner-logo" />

            <div>
              <strong> ¿Eres propietario de un establecimiento? </strong>

              <p>Consulta cómo gestionar tu negocio en EatsOK para llegar a más personas.</p>
            </div>
          </div>

          <button>
            Más información
            <span>↗</span>
          </button>
        </div>

        <p class="slogan">Everyone can tag along</p>
      </section>
    </main>
  </div>
</template>
