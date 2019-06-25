const baseConfig = {
  service_ip: 'http://192.168.23.10:9001',
  proxyRouter: ['/djproject'],
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
    }, {}),
    port: 8801,
  },
  // npm link 时需关闭 eslint 保存检测
  lintOnSave: false
};
