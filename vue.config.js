const baseConfig = {
  // service_ip: 'http://192.168.2.92:8089', //有缘
  service_ip: 'http://192.168.2.140:8080', // 戴信乐
  // service_ip: 'http://192.168.2.199:8080', //作鑫
  // service_ip: 'http://192.168.2.171:8080', //宏权
  // service_ip: 'http://172.17.0.134', //dev
  // service_ip: 'http://192.168.23.10:9011',
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
      '/handleOnceToken.do': {
        target: 'http://192.168.23.7',
        changeOrigin: true,
        pathRewrite: {
            '^/djsupplier': '/djwmsservice'
          }
      },
      '/djintelligent/firstPage/getWebFirstPageAll.do': {
        // target :'http://192.168.2.131:8081' // 南洋
        // target :'http://192.168.23.5:8090', // 开发
        target: 'http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/',
        // target: 'http://192.168.2.127:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/djintelligent/firstPage/getWebFirstPageAll.do': '/djsupplier/permission/consoleMenu2'
        }
      },
      '/djsupplier/firstPage/getWebFirstPageAll.do': {
        // target :'http://192.168.2.131:8081' // 南洋
        // target :'http://192.168.23.5:8090', // 开发
        target: 'http://192.168.23.4:3000/mock/5d131431c07efa4fd83ae7ae/',
        // target: 'http://192.168.2.127:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/djsupplier/firstPage/getWebFirstPageAll.do': '/djsupplier/permission/consoleMenu2'
        }
      },
    }),
    port: 8801,
  },
  // npm link 时需关闭 eslint 保存检测
  lintOnSave: false
};
