import Vue from 'vue';
import ELEMENT from 'element-ui';
// 引入公司组件、方法库
import djweb, {httpPolicy, listenerPolicy, methods} from 'djweb';
// import 'djweb/package/baseCss/index.less';
import filters from './filters';
import { regs, enumMap} from './utils';
import './assets/css/index.less';
// Date.prototype.toJSON = function () { //用于解决JSON.stringify转换JSON时日期时间不准确的问题，在search组件中有影响
//   return timeFormat(this, 'yyyy-MM-dd HH:mm:ss');
// };
Vue.use(djweb);
Vue.use(ELEMENT);
Vue.use(filters);

Vue.prototype.$method = methods;
Vue.prototype.$reg = regs;
Vue.prototype.$enum = enumMap;
Vue.prototype.$message = (text, type)=>{
   ELEMENT.Message({
    'showClose': true, //是否显示关闭按钮
    'message': text, //消息内容
    'type': type, //消息类型
    'duration': 2000 //显示时间
  });
};
Vue.mixin(httpPolicy);
Vue.mixin(listenerPolicy);
// Vue.config.productionTip = false;

export default Vue;
