/**
 * 存放权限路由
 */
// import loopRoutes from './loopRoutes';
import { loopRoutes } from 'djcpsweb-utils';
import baseSetting from './modules/baseSetting';
import prodManage from './modules/prodManage';
import paperStockManage from './modules/paperStockManage';
import statement from './modules/statement';
const _loopRoutes = loopRoutes(require('./_import'));
// const index = {
//   path: 'index',
//   meta: {
//     title: '首页',
//     homeRoute: true
//   },
//   component: 'views/index/index'
// };

const routes = [
  // {
  //   path: '/home',
  //   redirect: '/home/index',
  //   component: 'components/layout/layout',
  //   children: [
  //     index,
      baseSetting,
      prodManage,
      paperStockManage,
      statement
    // ]
  // }
].map(route => {
  route.name = route.path;
  return route;
});
export const routesMap = _loopRoutes(routes);
export default routes;
