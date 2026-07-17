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
      component: () => import('../mobile/index.vue'),
    },
    {
      path: '/mobile/login',
      name: 'login',
      component: () => import('../mobile/login.vue'),
    },
    {
      path: '/mobile/register',
      name: 'register',
      component: () => import('../mobile/register.vue'),
    },
    {
      path: '/mobile/statistics',
      name: 'statistics',
      component: () => import('../mobile/statistics.vue'),
    },
    {
      path: '/mobile/settings',
      name: 'settings',
      component: () => import('../mobile/settings.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: getCurrentMonthPath,
    },
  ],
})
