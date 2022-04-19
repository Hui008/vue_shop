import Vue from 'vue'
// 用户创建整个应用的路由器
import myLogin from '../components/myLogin'
import myHome from '../components/myHome'
import myWelcome from '../components/myWelcome'

import myUsers from '../components/user/myUsers'

import VueRouter from 'vue-router'

// 应用插件
Vue.use(VueRouter)

// 创建并暴露一个路由器
const router = new VueRouter({
  routes: [
    // 路由重定向  让原来在转发列表中发向主页路由的路径改成登录路径
    { path: '/', redirect: '/login' },
    { path: '/login', component: myLogin },
    {
      path: '/home',
      component: myHome,
      // 路由重定向  让原来在转发列表中发向主页路由的路径改成欢迎页面
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: myWelcome },
        { path: '/users', component: myUsers }
      ]
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
