import { routesMap } from '../../router/permissionRouter';
const tagsView = {
  state: {
    cachedViews: []
  },
  mutations: {
    ADD_CACHED_VIEWS: (state, newViewData) => {
      let route = findRoute(newViewData);
      if (route.meta.isKeep !== false) {
        if (!state.cachedViews.some(item => item === route.name)) {
          state.cachedViews.push(route.name);
        }
      }
    },
    DEL_CACHED_VIEWS: (state, view) => {
      let route = findRoute(view);
      for (const [i, name] of state.cachedViews.entries()) {
        if (name === route.name) {
          state.cachedViews.splice(i, 1);
          break;
        }
      }
    },
    DEL_ALL_VIEWS: (state) => {
      state.cachedViews = [];
    },
    DEL_OTHERS_VIEWS: (state, view) => {
      let route = findRoute(view);
      state.cachedViews = state.cachedViews.filter(name => name === route.name);
    }
  },
  actions: {
    delVisitedViews({commit}, view) {
      commit('DEL_CACHED_VIEWS', view);
    },
    delOthersViews({commit}, view) {
      commit('DEL_OTHERS_VIEWS', view);
    },
    delAllViews({commit}) {
      commit('DEL_ALL_VIEWS');
    },
    delCachedView({commit}, view) {
      commit('DEL_CACHED_VIEWS', view);
    },
    addCachedView({commit}, view) {
      commit('ADD_CACHED_VIEWS', view);
    },
  }
};

function findRoute(view) {
  let path = view.path.split('#')[1];
  let routeKey = Object.keys(routesMap).find(key => key.startsWith(path));
  return routesMap[routeKey];
}
export default tagsView;
