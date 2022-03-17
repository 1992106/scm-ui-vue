import { markRaw } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@src/layouts/BaseLayout.vue'

export const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'ErrorPage',
    redirect: () => ({ name: '404' }),
    meta: {
      hidden: true
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@layouts/system/404.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@layouts/system/403.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@layouts/system/Login.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: markRaw(BaseLayout),
    meta: {
      title: 'Redirect',
      hidden: true
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@layouts/system/Redirect.vue'),
        meta: {
          title: 'Redirect',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/',
    component: markRaw(BaseLayout),
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'dashboard',
        component: () => import('@views/Home.vue'),
        meta: {
          title: '仪表盘',
          icon: 'icon-dashboard'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export const resetRouter = () => {
  router.getRoutes().forEach(route => {
    const { name } = route
    if (name && !['ErrorPage', 'Login', 'Redirect'].includes(name)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export default router
