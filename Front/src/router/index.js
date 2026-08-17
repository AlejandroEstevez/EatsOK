import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: {
      template: '<div>Perfil alimentario</div>',
    },
  },
  {
    path: '/establishments',
    name: 'establishments',
    component: {
      template: '<div>Establecimientos</div>',
    },
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: {
      template: '<div>Recetas</div>',
    },
  },
  {
    path: '/account',
    name: 'account',
    component: {
      template: '<div>Cuenta</div>',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
