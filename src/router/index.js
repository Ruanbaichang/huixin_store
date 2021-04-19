import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName:"Login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName:"Login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName:"Login_home_welcome" */ '../components/Welcome.vue')
// import User from '../components/user/User.vue'
const User = () => import(/* webpackChunkName:"User_Rights_Role" */ '../components/user/User.vue')
// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName:"User_Rights_Role" */ '../components/power/Rights.vue')
// import Role from '../components/power/Role.vue'
const Role = () => import(/* webpackChunkName:"User_Rights_Role" */ '../components/power/Role.vue')
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName:"Cate_Params_List" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName:"Cate_Params_List" */ '../components/goods/Params.vue')
// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName:"Cate_Params_List" */ '../components/goods/List.vue')
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName:"Add_Order_Style" */ '../components/goods/Add.vue')
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName:"Add_Order_Style" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName:"Add_Order_Style" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/Welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Role },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }

    ]
  }

]

const router = new VueRouter({
  routes
})

// 添加路由守卫,没有token将强制跳转到登录页面
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    if (sessionStorage.token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
