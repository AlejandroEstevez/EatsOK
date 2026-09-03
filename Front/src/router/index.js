import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AccountView from '../views/AccountView.vue'
import FoodProfileView from '../views/FoodProfileView.vue'
import EstablishmentsView from '../views/EstablishmentsView.vue'
import EstablishmentDetailView from '../views/EstablishmentDetailView.vue'
import RecipeView from '../views/RecipesView.vue'
import OwnerRegisterView from '../views/OwnerRegisterView.vue'


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
    component: EstablishmentsView,
  },
  {
    path: '/establishments/:id',
    name: 'establishment-detail',
    component: EstablishmentDetailView,
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: RecipeView,
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
  {
    path: '/admin/owners/register',
    name: 'owner-register',
    component: OwnerRegisterView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
