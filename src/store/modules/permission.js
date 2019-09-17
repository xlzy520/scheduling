import paperWarehouseService from '../../api/service/paperWarehouse'
const permission = {
  state: {
    menus: [],
    permission: [],
    amountPermission: false
  },
  mutations: {
    ADD_MENUS: (state, data) => {
      state.menus = data;
    },
    ADD_PERMISSION: (state, data) => {
      state.permission = data;
    },
    SET_AMOUNTPERMISSION: (state, bool) => {
      state.amountPermission = bool;
    },
  },
  actions: {
    addMenus({commit}, data) {
      commit('ADD_MENUS', data);
    },
    addPermission({commit}, data) {
      commit('ADD_PERMISSION', data);
    },
    judgeAmountPermission({commit}) {
      return paperWarehouseService.judgeAmountAuth().then((res)=>{
        commit('SET_AMOUNTPERMISSION', res);
      });

    },
  }
};

export default permission;
