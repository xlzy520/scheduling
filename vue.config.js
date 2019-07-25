const baseConfig = {
  service_ip: 'http://192.168.23.10:9011',
  proxyRouter: ['/djsupplier'],
};

const webpackConfig = require('./webpack.env.config');

module.exports = {
  ...webpackConfig,
  devServer: {
    proxy: baseConfig.proxyRouter.reduce((sum, val) => {
      sum[val] = {
        target: baseConfig.service_ip,
        changeOrigin: true,
      };
      return sum;
    }, {
      '/djcps_web': {
        // target: 'http://192.168.2.127:3000',
        target: 'http://192.168.23.10:3000',
        changeOrigin: true,
      }
    }),
    port: 8801,
  },
  // npm link 时需关闭 eslint 保存检测
  lintOnSave: false
};
