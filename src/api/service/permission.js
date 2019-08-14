import { permission } from '../base-service/service';

export default {
  menu(value) {
    return permission('/menu.do', value).then(res => {
      const filterMenus = (routes, menu, parentPath = '/home') => {
        return routes.filter(route => {
          route.path = route.path.startsWith('/') ? route.path : '/' + route.path;
          route.path = parentPath + route.path;
          menu[route.path] = route;
          if (route.children) {
            route.children = filterMenus(route.children, menu, route.path);
          }
          return !route.hidden;
        });
      };
      let permissionMenu = {};
      let menus = filterMenus(res, permissionMenu);
      return { permissionMenu, menus };
    });
  }
};
