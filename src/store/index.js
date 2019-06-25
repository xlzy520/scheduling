import Vue from 'vue';
import Vuex from 'vuex';
import { DjStore } from 'djweb';
import tagsView from './modules/tagsView';
import permission from './modules/permission';
Vue.use(Vuex);
/**
 * DjStore对象已做自动getters映射,如果没有特殊需要不需要传getters
 */
const store = new DjStore(Vuex, {
  modules: {
    tagsView,
    permission,
  }
});

export default store;
