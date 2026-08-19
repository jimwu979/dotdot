import { createRouter, createWebHistory } from 'vue-router'

const getCurrentMonthPath = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `/desktop/${year}/${month}`
}

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: getCurrentMonthPath,
    },
    {
      path: '/desktop/:year(\\d{4})/:month(0[1-9]|1[0-2])',
      name: 'index',
      component: () => import('@/desktop/pages/index.vue'),
    },
    {
      path: '/desktop/statistics',
      name: 'statistics',
      component: () => import('@/desktop/pages/statistics.vue'),
    },
    {
      path: '/desktop/saving',
      name: 'saving',
      component: () => import('@/desktop/pages/saving.vue'),
    },
    {
      path: '/desktop/settings',
      name: 'settings',
      component: () => import('@/desktop/pages/settings.vue'),
    },
    {
      path: '/desktop/login',
      name: 'login',
      component: () => import('@/desktop/pages/login.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: getCurrentMonthPath,
    },
  ],
})
