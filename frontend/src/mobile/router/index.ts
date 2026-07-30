import { createRouter, createWebHistory } from 'vue-router'

const getCurrentMonthPath = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `/mobile/${year}/${month}`
}

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: getCurrentMonthPath,
    },
    {
      path: '/mobile/:year(\\d{4})/:month(0[1-9]|1[0-2])',
      name: 'index',
      component: () => import('@/mobile/pages/index.vue'),
    },
    {
      path: '/mobile/login',
      name: 'login',
      component: () => import('@/mobile/pages/login.vue'),
    },
    {
      path: '/mobile/register',
      name: 'register',
      component: () => import('@/mobile/pages/register.vue'),
    },
    {
      path: '/mobile/register-complete',
      name: 'register-complete',
      component: () => import('@/mobile/pages/register-complete.vue'),
    },
    {
      path: '/mobile/forgot-password',
      name: 'forgot-password',
      component: () => import('@/mobile/pages/forgot-password.vue'),
    },
    {
      path: '/mobile/reset-password',
      name: 'reset-password',
      component: () => import('@/mobile/pages/reset-password.vue'),
    },
    {
      path: '/mobile/statistics',
      name: 'statistics',
      component: () => import('@/mobile/pages/statistics.vue'),
    },
    {
      path: '/mobile/settings',
      name: 'settings',
      component: () => import('@/mobile/pages/settings/index.vue'),
    },
    {
      path: '/mobile/savings',
      name: 'savings',
      component: () => import('@/mobile/pages/savings.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: getCurrentMonthPath,
    },
  ],
})
