import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
import moment from 'moment'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入Nprogress包对应的js和css
import Nprogress from 'nprogress'
// import 'nprogress/nprogress.css'
// 富文本样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
Vue.filter('dateformat', (val) => {
  // unix 表示 里面是10位 是秒数  一般情况下是13位
  return moment.unix(val).format('YYYY-MM-DD HH:mm:ss')
})
Vue.component('tree-table', ZkTable)
// 开发环境，本地地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 正式环境
// axios.defaults.baseURL='http://api.itcast.cn/heima/'
// 通过axios请求拦截器添加token
axios.interceptors.request.use(config => {
  // 在拦截器中展示进度条
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
// 响应拦截器
axios.interceptors.response.use(response => {
  // 在拦截器中隐藏进度条
  Nprogress.done()
  // Do something before response is sent
  return response
}, error => {
  // Do something with response error
  return Promise.reject(error)
})
Vue.prototype.$http = axios
// 将富文本编辑器，注册为全局可用组件
Vue.use(VueQuillEditor /* { default global options } */)
// Vue.use(ElementUI)
Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
