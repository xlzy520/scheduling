import Vue from '../vuePackage';
import VueRouter from 'vue-router';
import permissionRouter from './permissionRouter';
import store from '../store';
const _import = require('./_import');
const { setLocalStorageItem } = require('djweb').methods;

Vue.use(VueRouter);
const viewsPath = 'views/';
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/404',
    name: '404',
    component: _import(viewsPath + '404')
  },
  {
    path: '/500',
    name: '500',
    component: _import(viewsPath + '500')
  },
];
export const asyncRouter = permissionRouter;
/**
 * 生成router实例时，只需要传没有权限要求的路由，不要传需要用户权限判断的路由
 */
let router = new VueRouter({
  routes
});
router.afterEach((to) => {
  let route = store.getters.permission[to.path];
  setLocalStorageItem('activeRoute', route);
  window.subject.trigger('route-change');
});
export default router;
