const permission = {
  state: {
    oname: null,
    id: null,
    ucompany: null,
    uids: null,
    uname: null
  },
  mutations: {
    SET_ONAME(state, data = {}) {
      state.oname = data.oname;
    },
    SET_ID(state, data = {}) {
      state.id = data.id;
    },
    SET_UCOMPANY(state, data = {}) {
      state.ucompany = data.ucompany;
    },
    SET_UIDS(state, data = {}) {
      state.uids = data.uids;
    },
    SET_UNAME(state, data = {}) {
      state.uname = data.uname;
    },
  },
  actions: {
    setUserMsg({commit}, data) {
      commit('SET_ONAME', data);
      commit('SET_ID', data);
      commit('SET_UCOMPANY', data);
      commit('SET_UIDS', data);
      commit('SET_UNAME', data);
    }
  }
};

export default permission;
