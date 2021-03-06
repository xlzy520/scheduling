import Vue from 'vue';
import Vuex from 'vuex';
import { DjStore } from 'djcpsweb-utils';
import permission from './modules/permission';
import user from './modules/user';
Vue.use(Vuex);
/**
 * DjStore对象已做自动getters映射,如果没有特殊需要不需要传getters
 */
const store = new DjStore(Vuex, {
  modules: {
    permission,
    user
  }
});
window.Dj_DATASOURCE_CACHE.personMsg.then(res=>{
  store.dispatch('setUserMsg', res);
});
window.subject.listen('cachedViews', updateCachedViews);
function updateCachedViews(...param) {
  store.dispatch(...param);
}

export default store;
