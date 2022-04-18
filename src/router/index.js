import Vue from 'vue'
// 用户创建整个应用的路由器
import myLogin from '../components/myLogin'
import myHome from '../components/myHome'

import VueRouter from 'vue-router'

// 应用插件
Vue.use(VueRouter)

// 创建并暴露一个路由器
const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    }, // 路由重定向  让原来在转发列表中发向主页路由的路径改成登录路径
    {
      path: '/login',
      component: myLogin
    },
    {
      path: '/home',
      component: myHome
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})

export default router
