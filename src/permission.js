import router from './router';
import { asyncRouter } from './router';
// import { Loading } from 'element-ui';
import { permission } from 'djweb';
// import { methods } from './utils';
import permissionService from './api/service/permission';
import store from './store';
import NProgress from 'nprogress'; // Progress 进度条
import 'nprogress/nprogress.css';// Progress 进度条样式
// const { getCookiesItem } = methods;
/**
 * 获取权限路由，需要返回所有有权限的路由路径，路由路径即
 * @returns {Promise<any>}
 */
function getPermission() {
  // return permissionService.menu().then(res => {
  //   store.dispatch('addMenus', res.menus);
  //   store.dispatch('addPermission', res.permissionMenu);
  //   return res.permissionMenu;
  // });
  return new Promise(resolve => {
    function getPer(routes, menu) {
      routes.forEach(route => {
        menu.push(route.path);
        if (route.children) {
          getPer(route.children, menu);
        }
      });
    }
    let permissionMenu = ['/home', 'product', 'index'];
    //如果是开发者状态，获取全部权限
    if (process.env.NODE_ENV === 'development') {
      getPer(asyncRouter, permissionMenu);
    }
    resolve(permissionMenu);
  });
}

/**
 * 登录方法，需要返回登录成功和登录失败时跳转的路由，不设置登录失败的跳转地址时自动跳到/500路由
 * @param to
 * @returns {Promise<any>}
 */
function login() {
  //该项目由自己的登录页，所以登录请求在登录页发送，此处直接处理没有登录情况下需要采取的措施就行了
  return Promise.reject('/login');
  // return new Promise((resolve) => {
  //   setCookiesItem('userName', 'gw');
  //   // reject();
  //   resolve('/home');
  // });
}

/**
 * 判断是否登录的方法
 * @returns {boolean}
 */
function isLogin() {
  // return getCookiesItem('token') !== undefined;
  return true;
}

permission({
  router, //路由实例
  // limit: getLimit(), //某些有权限路由的特殊限制，传入一个对象，key为路由路径，value为特殊限制的方法
  // routeCallBack(a) { //拦截路由跳转方法
  //   // console.log('falseCallBack', a);
  //   return a;
  // },
  // whiteListing: ['/404', '/500'],
  login, //登录方法
  getPermission, //获取权限方法
  isLogin, //判断是否登录的方法
  asyncRouter, //所有权限路由
  animate: { //路由跳转的动画
    start: () => {
      return NProgress.start();
    },
    end: () => {
      NProgress.done();
    }
  }
});
