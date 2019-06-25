const permission = {
  state: {
    menus: [],
    permission: [],
  },
  mutations: {
    ADD_MENUS: (state, data) => {
      state.menus = data;
    },
    ADD_PERMISSION: (state, data) => {
      state.permission = data;
    },
  },
  actions: {
    addMenus({commit}, data) {
      commit('ADD_MENUS', data);
    },
    addPermission({commit}, data) {
      commit('ADD_PERMISSION', data);
    },
  }
};

export default permission;
