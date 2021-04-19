module.exports = {
  lintOnSave: true,
  devServer: {
    host: '127.0.0.1',
    open: true,
    port: 8080
  },
  chainWebpack: config => {
    // 发布模式
    config
      .when(process.env.NODE_ENV === 'production', config => {
        config.plugin('html')
          .tap(args => {
            args[0].isProd = true
            return args
          })
        config.set('externals', {
          moment: 'window.moment',
          // import vue from 'vue'
          vue: 'window.Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          lodash: '_',
          echarts: 'echarts',
          nprogress: 'NProgress',
          'vue-quill-editor': 'VueQuillEditor'
        })

        // entry找到默认的打包入口，调用clear则是删除默认的打包入口
        // add添加新的打包入口
        config.entry('app').clear().add('./src/main.prod.js')
      })
    // 开发模式
    config
      .when(process.env.NODE_ENV === 'development', config => {
        config.plugin('html')
          .tap(args => {
            args[0].isProd = false
            return args
          })
        config.entry('app').clear().add('./src/main.dev.js')
      })
  }
}
