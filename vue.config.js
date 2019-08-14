const baseConfig = {
  // service_ip: 'http://192.168.2.92:8089', //有缘
  // service_ip: 'http://192.168.2.199:8080', //作鑫
  // service_ip: 'http://192.168.2.171:8080', //宏权
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
      },
      '/test': {
        target: 'http://192.168.0.237',
        changeOrigin: true,
        pathRewrite: {
          '^/test': '/test'
        }
      },
      '/djproject': {
        target: 'http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/',
        changeOrigin: true,
        pathRewrite: {
          '^/djproject': '/djsupplier'
        }
      },
      '/handleOnceToken.do': {
        target: 'http://192.168.23.7',
        changeOrigin: true,
        pathRewrite: {
            '^/djsupplier': '/djwmsservice'
          }
      },
      '/menu.do': {
        target: 'http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/',
        changeOrigin: true
      }
    }),
    port: 8801,
  },
  // npm link 时需关闭 eslint 保存检测
  lintOnSave: false
};
