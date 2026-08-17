import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CheckinView from '../views/CheckinView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/checkin', component: CheckinView },
    { path: '/admin', component: AdminView }
  ]
})

// Kiểm tra quyền truy cập (Guard)
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('fcdbb_user'))
  if (to.path !== '/login' && !user) {
    next('/login')
  } else if (to.path === '/admin' && user?.role !== 'admin') {
    next('/checkin')
  } else {
    next()
  }
})

export default router