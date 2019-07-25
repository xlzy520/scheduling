const { getSessionItem, setSessionItem } = require('djweb').methods;
const tagsView = {
  state: {
    visitedViews: getSessionItem("visitedViews") || [],
    cachedViews: getSessionItem('cachedViews') || []
  },
  mutations: {
    ADD_VISITED_VIEWS: (state, view) => {
      const { name, path, meta = {}, query, fullPath } = view;
      state.visitedViews.push({
        meta,
        name,
        path,
        title: meta.title || 'no-name',
        query,
        fullPath,
        isHome: meta.homeRoute
      });
      setSessionItem('visitedViews', state.visitedViews);
    },
    DEL_VISITED_VIEWS: (state, view) => {
      for (const [i, v] of state.visitedViews.entries()) {
        if (v.path === view.path) {
          state.visitedViews.splice(i, 1);
          setSessionItem('visitedViews', state.visitedViews);
          break;
        }
      }
    },
    ADD_CACHED_VIEWS: (state, newViewData) => {
      // 保存缓存页name
      if (newViewData.meta.isKeep !== false) {
        if (!state.cachedViews.some(item => item === newViewData.name)) {
          state.cachedViews.push(newViewData.name);
          setSessionItem('cachedViews', state.cachedViews);
        }
      }
    },
    DEL_CACHED_VIEWS: (state, view) => {
      for (const [i, name] of state.cachedViews.entries()) {
        if (name === view.name) {
          state.cachedViews.splice(i, 1);
          setSessionItem('cachedViews', state.cachedViews);
          break;
        }
      }
    },
    DEL_ALL_VIEWS: (state) => {
      state.visitedViews = [];
      state.cachedViews = [];
      setSessionItem('visitedViews', []);
      setSessionItem('cachedViews', []);
    },
    UPDATE_VISITED_VIEW: (state, view) => {
      for (let v of state.visitedViews) {
        if (v.path === view.path) {
          const { name, path, meta = {}, query, fullPath } = view;
          v = Object.assign(v, {
            name,
            path,
            title: meta.title || 'no-name',
            query,
            fullPath,
            isHome: meta.homeRoute
          });
          setSessionItem('visitedViews', state.visitedViews);
          break;
        }
      }
    },
    DEL_OTHERS_VIEWS: (state, view) => {
      state.visitedViews = state.visitedViews.filter(obj=>obj === view);
      state.cachedViews = state.cachedViews.filter(name=>name === view.name);
      setSessionItem('visitedViews', state.visitedViews);
      setSessionItem('cachedViews', state.cachedViews);
    }
  },
  actions: {
    //若为新tab，push新数据，修改激活新view；若为历史tab，激活历史view
    addVisitedViews({commit, state}, newViewData) {
      //相同路由（path、name全相等）---直接return
      let isViewInCache = state.visitedViews.find(v => v.path === newViewData.path && v.name === newViewData.name);
      if (!isViewInCache) {
        commit('ADD_VISITED_VIEWS', newViewData);
        commit('ADD_CACHED_VIEWS', newViewData);
      }
    },
    //删除
    delVisitedViews({commit}, view) {
      commit('DEL_VISITED_VIEWS', view);
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
    updateVisitedView({commit}, view) {
      commit('UPDATE_VISITED_VIEW', view);
    }
  }
};

export default tagsView;
