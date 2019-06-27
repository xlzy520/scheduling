/**
 * 存放权限路由
 */
import loopRoutes from './loopRoutes';
import modules_routes from './modules/index';

const index = {
  path: 'index',
  meta: {
    title: '首页',
    homeRoute: true
  },
  component: 'views/index/index'
};

const routes = [
  {
    path: '/home',
    redirect: '/home/index',
    component: 'components/layout/layout',
    children: [
      index,
      ...modules_routes
    ]
  }
].map(route => {
  route.name = route.path;
  return route;
});
loopRoutes(routes);
export default routes;
