import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const settingPageModules = import.meta.glob('../pages/settings/**/*.vue')

const settingRoutes: RouteRecordRaw[] = Object.entries(settingPageModules)
  .map(([filePath, component]) => {
    const segments = filePath
      .replace('../pages/settings/', '')
      .replace(/\.vue$/, '')
      .split('/')

    if (segments.at(-1) === 'index') {
      segments.pop()
    }

    const routeSegments = segments.map((segment) => {
      const catchAllParam = segment.match(/^\[\.\.\.(.+)\]$/)
      const dynamicParam = segment.match(/^\[(.+)\]$/)

      if (catchAllParam) {
        return `:${catchAllParam[1]}(.*)*`
      }

      if (dynamicParam) {
        return `:${dynamicParam[1]}`
      }

      return segment
    })
    const suffix = routeSegments.length > 0 ? `/${routeSegments.join('/')}` : ''
    const nameSuffix = segments
      .map((segment) => segment.replace(/^\[\.\.\.(.+)\]$/, '$1').replace(/^\[(.+)\]$/, '$1'))
      .join('-')

    return {
      path: `/mobile/settings${suffix}`,
      name: nameSuffix ? `settings-${nameSuffix}` : 'settings',
      component,
    }
  })
  .sort((routeA, routeB) => {
    const dynamicCountA = (routeA.path.match(/:/g) ?? []).length
    const dynamicCountB = (routeB.path.match(/:/g) ?? []).length

    return dynamicCountA - dynamicCountB || routeA.path.localeCompare(routeB.path)
  })

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
      component: () => import('@/mobile/pages/login/index.vue'),
    },
    {
      path: '/mobile/register',
      name: 'register',
      component: () => import('@/mobile/pages/login/register.vue'),
    },
    {
      path: '/mobile/register-complete',
      name: 'register-complete',
      component: () => import('@/mobile/pages/login/register-complete.vue'),
    },
    {
      path: '/mobile/forgot-password',
      name: 'forgot-password',
      component: () => import('@/mobile/pages/login/forgot-password.vue'),
    },
    {
      path: '/mobile/reset-password',
      name: 'reset-password',
      component: () => import('@/mobile/pages/login/reset-password.vue'),
    },
    {
      path: '/mobile/statistics',
      name: 'statistics',
      component: () => import('@/mobile/pages/statistics/index.vue'),
    },
    {
      path: '/mobile/statistics/:year(\\d{4})/:month(0[1-9]|1[0-2])',
      name: 'statistics-month',
      component: () => import('@/mobile/pages/statistics/month.vue'),
    },
    {
      path: '/mobile/statistics/:year(\\d{4})/:month(0[1-9]|1[0-2])/:kind(income|expense)/:categoryId(\\d+)',
      name: 'statistics-category',
      component: () => import('@/mobile/pages/statistics/category.vue'),
    },
    {
      path: '/mobile/record',
      name: 'record',
      component: () => import('@/mobile/pages/record.vue'),
    },
    ...settingRoutes,
    {
      path: '/mobile/saving',
      name: 'saving',
      component: () => import('@/mobile/pages/saving.vue'),
    },
    {
      path: '/mobile/saving-edit',
      name: 'saving-edit',
      component: () => import('@/mobile/pages/saving-edit.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: getCurrentMonthPath,
    },
  ],
})
