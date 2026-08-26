import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AccountView from '../views/AccountView.vue'
import FoodProfileView from '../views/FoodProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/profile',
    name: 'food-profile',
    component: FoodProfileView,
  },
  {
    path: '/establishments',
    name: 'establishments',
    component: () => import('../views/EstablishmentsView.vue'),
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
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/account',
    name: 'account',
    component: AccountView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
