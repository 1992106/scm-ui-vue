import { markRaw } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@src/layouts/BaseLayout.vue'

export const routes = [
  {
    path: '/404',
    name: '404',
    component: () => import('@src/layouts/system/404.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@src/layouts/system/403.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@src/layouts/system/Login.vue'),
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
        component: () => import('@src/layouts/system/Redirect.vue'),
        meta: {
          title: 'Redirect',
          hidden: true
        }
      }
    ]
  },
  {
    path: '/',
    index: 'index',
    component: markRaw(BaseLayout),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@views/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'icon-dashboard'
        }
      },
      {
        path: 'example',
        name: 'Example',
        component: () => import('@views/Example.vue'),
        meta: {
          title: '业务组件',
          icon: 'icon-database'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'ErrorPage',
    redirect: () => ({ name: '404' }),
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 白名单路由
export const whiteRoutes = ['404', '403', 'Login', 'Redirect', 'ErrorPage', 'index']

// 重置路由
export const resetRouter = () => {
  router.getRoutes().forEach(route => {
    const { name } = route
    if (name && !whiteRoutes.includes(name)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export default router
