const _import = require('./_import');
//前端路由扁平化，适配后端权限
const loopRoutes = (routes, parentPath = '') => {
  let addList = [];
  let removeNum = 0;
  routes.forEach((route, index) => {
    route.path = route.path.startsWith('/') ? route.path : '/' + route.path;
    route.path = parentPath + route.path;
    route.name = route.path.split('/').filter(item => item).map((item, index) => {
      if (index !== 0) {
        item = item.slice(0, 1).toUpperCase() + item.slice(1);
        item = item.replace(':', '');
      }
      return item;
    }).join('');
    if (route.component && (Object.prototype.toString.call(route.component) === "[object String]")) {
      route.component = _import(route.component, route.name);
    }
    if (route.children) {
      loopRoutes(route.children, route.path);
      if (!route.component) {
        addList.push(...route.children);
        if (!route.redirect) {
          routes.splice(index - removeNum, 1);
          removeNum++;
        } else {
          delete route.children;
        }
      }
    }
  });
  routes.push(...addList);
};
export default loopRoutes;
