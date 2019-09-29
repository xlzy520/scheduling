// ps：有些webpack 配置 在vue cli3.0中，被映射成不一样的字段，例如下面两个：
// 你应该修改 vue.config.js 中的 outputDir 选项而不是修改 output.path；
// 你应该修改 vue.config.js 中的 publicPath 选项而不是修改 output.publicPath。
// 这些配置项，在configureWebpack中直接修改build会报错，只能通过vue cli3.0的 api 配置项进行修改
const config = {
  assetsDir: 'supplierStatic',
  fileServe: process.env.fileServe || '/'

};
const production = {
  // 项目静态资源文件服务地址，包括整个打包后输出的文件static assets (js, css, img, fonts)
  publicPath: config.fileServe,
  // A directory (relative to outputDir) to nest generated static assets (js, css, img, fonts) under.
  assetsDir: config.assetsDir,
  productionSourceMap: false,
  configureWebpack: config => {
    config.entry.app = ['babel-polyfill', './src/main.js'];
    config.externals = {
      'vue': 'Vue',
      "element-ui": "ELEMENT",
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'axios': 'axios',
      // 组件库也会影响打包的大小，赞不去除
      'djweb': 'djweb',
    };
  }
};
const development = {
  configureWebpack: config => {
    // 如果需要浏览器vue的调试插件，就全部注释externals
    // 不需要就全部开启
    config.externals = {
      'vue': 'Vue',
      "element-ui": "ELEMENT",
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'axios': 'axios',
      'djweb': 'djweb',
    };
  },
};
const exportObject = {
  production,
  development
};
module.exports = exportObject[process.env.NODE_ENV];
