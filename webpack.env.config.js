// ps：有些webpack 配置 在vue cli3.0中，被映射成不一样的字段，例如下面两个：
// 你应该修改 vue.config.js 中的 outputDir 选项而不是修改 output.path；
// 你应该修改 vue.config.js 中的 publicPath 选项而不是修改 output.publicPath。
// 这些配置项，在configureWebpack中直接修改build会报错，只能通过vue cli3.0的 api 配置项进行修改
const production = {
  publicPath: 'http://192.168.2.167:9000/cloud_menu_dist/',
  outputDir: './dist',
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
      // 'djweb': 'djweb',
    };
  },
  // 修改plugin配置
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = 'index.html';
        return args;
      });
  }
};
const development = {
  configureWebpack: config => {

    config.externals = {
      'vue': 'Vue',
      "element-ui": "ELEMENT",
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'axios': 'axios',
      // 'djweb': 'djweb',
    };
  },
};
const exportObject = {
  production,
  development
};
module.exports = exportObject[process.env.NODE_ENV];
