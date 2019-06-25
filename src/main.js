// import './compatible';//浏览器版本过低处理
import Vue from './vuePackage';
import store from './store/index';
import App from './App';
import router from './router';
import './permission';

new Vue({ // eslint-disable-line
  render: h => h(App),
  router,
  store
}).$mount('#app');
