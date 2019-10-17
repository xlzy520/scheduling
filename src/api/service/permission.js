
export default {
  menu() {
    // if (window.MENU_CACHE === undefined) {
    //   window.MENU_CACHE = baseService('/djsupplier')('/firstPage/getWebFirstPageAll.do', params, 'get');
    // }
    // return window.MENU_CACHE.then(res => {
    //   res = res.list || [];
    //   let _res = deepClone(res).find(item => item.id === envConfig.PROJECTID).children;
    //   const filterMenus = (routes, menu, parentPath = '') => {
    //     return routes.filter(route => {
    //       route.path = route.path.startsWith('/') ? route.path : '/' + route.path;
    //       route.path = parentPath + route.path;
    //       menu[route.path] = route;
    //       if (route.children) {
    //         route.children = filterMenus(route.children, menu, route.path);
    //       }
    //       return !route.hidden;
    //     });
    //   };
    //   let permissionMenu = {};
    //   let menus = filterMenus(_res, permissionMenu);
    //   return {permissionMenu, menus};
    // });
    return window.Dj_DATASOURCE_CACHE.getPermission(window.globalVariable.projectID);
  },
};
